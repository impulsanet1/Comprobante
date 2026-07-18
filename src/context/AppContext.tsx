/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, onAuthStateChanged, signOut, sendPasswordResetEmail, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { BusinessConfig, SocialNetwork, Service, Receipt, Client, ReceiptItem } from "../types";
import { DEFAULT_BUSINESS_CONFIG, DEFAULT_SOCIAL_NETWORKS, DEFAULT_SERVICES } from "../defaultData";

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  loadingData: boolean;
  businessConfig: BusinessConfig;
  socialNetworks: SocialNetwork[];
  services: Service[];
  receipts: Receipt[];
  clients: Client[];
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Settings actions
  updateBusinessConfig: (config: Partial<BusinessConfig>) => Promise<void>;
  
  // Social Networks actions
  addSocialNetwork: (sn: SocialNetwork) => Promise<void>;
  updateSocialNetwork: (sn: SocialNetwork) => Promise<void>;
  deleteSocialNetwork: (id: string) => Promise<void>;
  
  // Services actions
  addService: (service: Service) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  
  // Receipts actions
  createReceipt: (receiptData: Omit<Receipt, "id" | "consecutive">) => Promise<Receipt>;
  
  // System Maintenance
  restoreDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  // 2. Listen & Sync Firestore Data when Logged In
  useEffect(() => {
    if (!user) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Sync business config
    const configRef = doc(db, "config", "business");
    const unsubConfig = onSnapshot(configRef, async (docSnap) => {
      if (docSnap.exists()) {
        const configData = docSnap.data() as BusinessConfig;
        setBusinessConfig(configData);

        // One-time migration for existing databases to seed Facebook and its services
        if (!configData.facebookSeeded) {
          console.log("Migration: Seeding Facebook and its services...");
          try {
            // 1. Seed Facebook social network if missing
            const fbNetRef = doc(db, "social_networks", "facebook");
            const fbNetSnap = await getDoc(fbNetRef);
            if (!fbNetSnap.exists()) {
              await setDoc(fbNetRef, {
                name: "Facebook",
                icon: "Facebook"
              });
            }

            // 2. Seed Facebook services if missing
            const fbServices = DEFAULT_SERVICES.filter((s) => s.socialNetworkId === "facebook");
            for (const srv of fbServices) {
              const srvRef = doc(db, "services", srv.id);
              const srvSnap = await getDoc(srvRef);
              if (!srvSnap.exists()) {
                await setDoc(srvRef, {
                  socialNetworkId: srv.socialNetworkId,
                  name: srv.name,
                  quantities: srv.quantities
                });
              }
            }

            // 3. Mark as seeded in the business configuration doc
            await updateDoc(configRef, { facebookSeeded: true });
          } catch (migError) {
            console.error("Failed to migrate/seed Facebook:", migError);
          }
        }

        // Self-healing / Migration: If the existing WhatsApp is not the Colombian one,
        // we automatically upgrade/reseed the services and business configurations.
        if (configData.whatsapp !== "573208354198") {
          console.log("Upgrading database schema for Colombian Pesos and Whatsapp...");
          await setDoc(configRef, { ...DEFAULT_BUSINESS_CONFIG, facebookSeeded: true });

          // Re-initialize default social networks
          const socialQuery = await getDocs(collection(db, "social_networks"));
          for (const sDoc of socialQuery.docs) {
            await deleteDoc(doc(db, "social_networks", sDoc.id));
          }
          for (const sn of DEFAULT_SOCIAL_NETWORKS) {
            await setDoc(doc(db, "social_networks", sn.id), {
              name: sn.name,
              icon: sn.icon
            });
          }

          // Re-initialize default services
          const servicesQuery = await getDocs(collection(db, "services"));
          for (const sDoc of servicesQuery.docs) {
            await deleteDoc(doc(db, "services", sDoc.id));
          }
          for (const srv of DEFAULT_SERVICES) {
            await setDoc(doc(db, "services", srv.id), {
              socialNetworkId: srv.socialNetworkId,
              name: srv.name,
              quantities: srv.quantities
            });
          }
        }
      } else {
        // First run initialization
        const initialConfig = { ...DEFAULT_BUSINESS_CONFIG, facebookSeeded: true };
        await setDoc(configRef, initialConfig);
        setBusinessConfig(initialConfig);
      }
    });

    // Sync social networks
    const socialNetworksRef = collection(db, "social_networks");
    const unsubSocial = onSnapshot(socialNetworksRef, async (querySnap) => {
      if (!querySnap.empty) {
        const sns: SocialNetwork[] = [];
        querySnap.forEach((doc) => {
          sns.push({ id: doc.id, ...doc.data() } as SocialNetwork);
        });
        setSocialNetworks(sns);
      } else {
        // Initialize default social networks
        for (const sn of DEFAULT_SOCIAL_NETWORKS) {
          await setDoc(doc(db, "social_networks", sn.id), {
            name: sn.name,
            icon: sn.icon
          });
        }
      }
    });

    // Sync services
    const servicesRef = collection(db, "services");
    const unsubServices = onSnapshot(servicesRef, async (querySnap) => {
      if (!querySnap.empty) {
        const srvs: Service[] = [];
        let hasUSD = false;
        querySnap.forEach((doc) => {
          const data = doc.data() as Service;
          srvs.push({ id: doc.id, ...data } as Service);
          if (data.quantities && data.quantities.some(q => q.suggestedPrice > 0 && q.suggestedPrice < 300)) {
            hasUSD = true;
          }
        });
        
        if (hasUSD) {
          console.log("USD values detected in services. Self-healing / Reseeding to Colombian Pesos defaults...");
          for (const sDoc of querySnap.docs) {
            await deleteDoc(doc(db, "services", sDoc.id));
          }
          for (const srv of DEFAULT_SERVICES) {
            await setDoc(doc(db, "services", srv.id), {
              socialNetworkId: srv.socialNetworkId,
              name: srv.name,
              quantities: srv.quantities
            });
          }
        } else {
          setServices(srvs);
        }
      } else {
        // Initialize default services
        for (const srv of DEFAULT_SERVICES) {
          await setDoc(doc(db, "services", srv.id), {
            socialNetworkId: srv.socialNetworkId,
            name: srv.name,
            quantities: srv.quantities
          });
        }
      }
    });

    // Sync receipts (order by date descending)
    const receiptsRef = collection(db, "receipts");
    const receiptsQuery = query(receiptsRef, orderBy("date", "desc"));
    const unsubReceipts = onSnapshot(receiptsQuery, (querySnap) => {
      const recs: Receipt[] = [];
      querySnap.forEach((doc) => {
        recs.push({ id: doc.id, ...doc.data() } as Receipt);
      });
      setReceipts(recs);
    });

    // Sync clients
    const clientsRef = collection(db, "clients");
    const unsubClients = onSnapshot(clientsRef, (querySnap) => {
      const cls: Client[] = [];
      querySnap.forEach((doc) => {
        cls.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(cls);
      setLoadingData(false);
    });

    return () => {
      unsubConfig();
      unsubSocial();
      unsubServices();
      unsubReceipts();
      unsubClients();
    };
  }, [user]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If it's a first time launch, let's automatically check if there are no registered users in authentication,
      // and if the credentials are the default ones, create the account. This is a robust fallback for sandboxed runtimes.
      if (
        (email === "admin@impulsanet.com" && password === "impulsa2026") ||
        (email === "sergioruizv04@gmail.com" && password === "sergio11")
      ) {
        const { createUserWithEmailAndPassword } = await import("firebase/auth");
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          return;
        } catch (createErr) {
          // If creation fails (e.g. user already exists but password was changed), throw original error
          throw error;
        }
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Settings Operations
  const updateBusinessConfig = async (config: Partial<BusinessConfig>) => {
    const configRef = doc(db, "config", "business");
    await updateDoc(configRef, config);
  };

  // Social Networks Operations
  const addSocialNetwork = async (sn: SocialNetwork) => {
    await setDoc(doc(db, "social_networks", sn.id), {
      name: sn.name,
      icon: sn.icon
    });
  };

  const updateSocialNetwork = async (sn: SocialNetwork) => {
    await updateDoc(doc(db, "social_networks", sn.id), {
      name: sn.name,
      icon: sn.icon
    });
  };

  const deleteSocialNetwork = async (id: string) => {
    // Delete social network doc
    await deleteDoc(doc(db, "social_networks", id));
    
    // Also delete associated services
    const associatedServices = services.filter((s) => s.socialNetworkId === id);
    for (const s of associatedServices) {
      await deleteService(s.id);
    }
  };

  // Services Operations
  const addService = async (service: Service) => {
    await setDoc(doc(db, "services", service.id), {
      socialNetworkId: service.socialNetworkId,
      name: service.name,
      quantities: service.quantities
    });
  };

  const updateService = async (service: Service) => {
    await updateDoc(doc(db, "services", service.id), {
      socialNetworkId: service.socialNetworkId,
      name: service.name,
      quantities: service.quantities
    });
  };

  const deleteService = async (id: string) => {
    await deleteDoc(doc(db, "services", id));
  };

  // Receipt & Client Generation
  const createReceipt = async (receiptData: Omit<Receipt, "id" | "consecutive">) => {
    // Calculate consecutive number: find max consecutive in existing receipts
    const nextConsecutive = receipts.length > 0 
      ? Math.max(...receipts.map((r) => r.consecutive)) + 1 
      : 1001;

    // Create receipt document reference (with auto id)
    const receiptsRef = collection(db, "receipts");
    
    const finalReceipt = {
      ...receiptData,
      consecutive: nextConsecutive
    };

    const docRef = await addDoc(receiptsRef, finalReceipt);
    const receiptId = docRef.id;

    // Update or Create Client
    // Normalize client name + phone to find unique identifier
    const clientId = `${receiptData.clientName.trim().toLowerCase().replace(/\s+/g, "-")}-${receiptData.clientPhone.trim().replace(/\D/g, "")}`;
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (clientSnap.exists()) {
      const currentClient = clientSnap.data() as Client;
      await setDoc(clientRef, {
        ...currentClient,
        purchaseCount: currentClient.purchaseCount + 1,
        totalSpent: currentClient.totalSpent + receiptData.totalCharged,
        lastPurchaseDate: receiptData.date,
        receiptIds: [...currentClient.receiptIds, receiptId]
      });
    } else {
      const newClient: Client = {
        id: clientId,
        name: receiptData.clientName.trim(),
        phone: receiptData.clientPhone.trim(),
        purchaseCount: 1,
        totalSpent: receiptData.totalCharged,
        lastPurchaseDate: receiptData.date,
        receiptIds: [receiptId]
      };
      await setDoc(clientRef, newClient);
    }

    return {
      ...finalReceipt,
      id: receiptId
    };
  };

  const restoreDefaults = async () => {
    // Re-initialize default social networks
    const socialQuery = await getDocs(collection(db, "social_networks"));
    for (const sDoc of socialQuery.docs) {
      await deleteDoc(doc(db, "social_networks", sDoc.id));
    }
    for (const sn of DEFAULT_SOCIAL_NETWORKS) {
      await setDoc(doc(db, "social_networks", sn.id), {
        name: sn.name,
        icon: sn.icon
      });
    }

    // Re-initialize default services
    const servicesQuery = await getDocs(collection(db, "services"));
    for (const sDoc of servicesQuery.docs) {
      await deleteDoc(doc(db, "services", sDoc.id));
    }
    for (const srv of DEFAULT_SERVICES) {
      await setDoc(doc(db, "services", srv.id), {
        socialNetworkId: srv.socialNetworkId,
        name: srv.name,
        quantities: srv.quantities
      });
    }

    // Reset config
    const configRef = doc(db, "config", "business");
    const initialConfig = { ...DEFAULT_BUSINESS_CONFIG, facebookSeeded: true };
    await setDoc(configRef, initialConfig);
    setBusinessConfig(initialConfig);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingAuth,
        loadingData,
        businessConfig,
        socialNetworks,
        services,
        receipts,
        clients,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        updateBusinessConfig,
        addSocialNetwork,
        updateSocialNetwork,
        deleteSocialNetwork,
        addService,
        updateService,
        deleteService,
        createReceipt,
        restoreDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
