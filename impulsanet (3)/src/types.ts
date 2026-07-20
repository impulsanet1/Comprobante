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
  orderIds?: string[]; // IDs multiples del pedido para soportar 2 o mas IDs
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
  status?: "en_proceso" | "completado" | "garantia_en_proceso" | "cancelado" | "pendiente" | "finalizado" | "garantia_solicitada" | "garantia_finalizada";
  internalNotes?: string;
}

export interface Client {
  id: string; // Normalized name + phone
  name: string;
  phone: string;
  purchaseCount: number;
  totalSpent: number;
  lastPurchaseDate: string;
  receiptIds: string[];
  tag?: string; // e.g. "VIP", "Frecuente", "Mayorista", "Nuevo"
}

export function getNormalizedStatus(status?: string): "en_proceso" | "completado" | "garantia_en_proceso" | "cancelado" {
  if (!status) return "en_proceso";
  const s = status.trim().toLowerCase();
  if (s === "en_proceso" || s === "pendiente") return "en_proceso";
  if (s === "completado" || s === "finalizado" || s === "garantia_finalizada") return "completado";
  if (s === "garantia_en_proceso" || s === "garantia_solicitada") return "garantia_en_proceso";
  if (s === "cancelado") return "cancelado";
  return "en_proceso"; // default fallback
}
