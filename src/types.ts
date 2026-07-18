/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BusinessConfig {
  businessName: string;
  logoUrl: string;
  whatsapp: string;
  warrantyDays: number;
  facebookSeeded?: boolean;
}

export interface SocialNetwork {
  id: string; // e.g., 'instagram'
  name: string; // e.g., 'Instagram'
  icon: string; // lucide icon name
}

export interface ServiceQuantity {
  id: string; // Unique ID for quantity config
  quantity: number; // e.g., 1000
  providerCost: number;
  suggestedPrice: number;
  active: boolean;
}

export interface Service {
  id: string;
  socialNetworkId: string;
  name: string; // e.g., 'Seguidores', 'Likes'
  quantities: ServiceQuantity[];
}

export interface ReceiptItem {
  id: string; // Unique item ID
  socialNetworkId: string;
  socialNetworkName: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  suggestedPrice: number;
  chargedPrice: number;
  providerCostAtPurchase: number; // Snapshot of the provider cost
  orderId: string; // ID del pedido
}

export interface Receipt {
  id: string; // Firestore document ID
  consecutive: number; // Consecutive order number
  clientName: string;
  clientPhone: string;
  date: string; // ISO string format
  services: ReceiptItem[];
  subtotal: number;
  totalCharged: number;
  totalProviderCost: number;
  totalProfit: number;
  warranty: string; // e.g., "30 días"
  thankYouMessage: string;
}

export interface Client {
  id: string; // Normalized name + phone
  name: string;
  phone: string;
  purchaseCount: number;
  totalSpent: number;
  lastPurchaseDate: string;
  receiptIds: string[];
}
