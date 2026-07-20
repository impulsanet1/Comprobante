/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SocialNetwork, Service, BusinessConfig } from "./types";

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: "ImpulsaNet",
  logoUrl: "", // Empty means text logo
  whatsapp: "573208354198", // Default Colombian number
  warrantyDays: 30,
  facebookSeeded: true
};

export const DEFAULT_SOCIAL_NETWORKS: SocialNetwork[] = [
  { id: "instagram", name: "Instagram", icon: "Instagram" },
  { id: "facebook", name: "Facebook", icon: "Facebook" },
  { id: "tiktok", name: "TikTok", icon: "Video" },
  { id: "youtube", name: "YouTube", icon: "Youtube" }
];

export const DEFAULT_SERVICES: Service[] = [
  // INSTAGRAM
  {
    id: "ig-followers",
    socialNetworkId: "instagram",
    name: "Seguidores",
    quantities: [
      { id: "ig-f-1000", quantity: 1000, providerCost: 6000, suggestedPrice: 15000, active: true },
      { id: "ig-f-2000", quantity: 2000, providerCost: 11000, suggestedPrice: 28000, active: true },
      { id: "ig-f-5000", quantity: 5000, providerCost: 25000, suggestedPrice: 65000, active: true },
      { id: "ig-f-10000", quantity: 10000, providerCost: 45000, suggestedPrice: 120000, active: true }
    ]
  },
  {
    id: "ig-likes",
    socialNetworkId: "instagram",
    name: "Likes",
    quantities: [
      { id: "ig-l-1000", quantity: 1000, providerCost: 3000, suggestedPrice: 8000, active: true },
      { id: "ig-l-2000", quantity: 2000, providerCost: 5500, suggestedPrice: 15000, active: true },
      { id: "ig-l-5000", quantity: 5000, providerCost: 12000, suggestedPrice: 32000, active: true },
      { id: "ig-l-10000", quantity: 10000, providerCost: 22000, suggestedPrice: 60000, active: true }
    ]
  },
  {
    id: "ig-views",
    socialNetworkId: "instagram",
    name: "Vistas",
    quantities: [
      { id: "ig-v-10000", quantity: 10000, providerCost: 4000, suggestedPrice: 12000, active: true },
      { id: "ig-v-20000", quantity: 20000, providerCost: 7500, suggestedPrice: 22000, active: true },
      { id: "ig-v-50000", quantity: 50000, providerCost: 16000, suggestedPrice: 50000, active: true },
      { id: "ig-v-100000", quantity: 100000, providerCost: 30000, suggestedPrice: 90000, active: true }
    ]
  },
  {
    id: "ig-comments",
    socialNetworkId: "instagram",
    name: "Comentarios",
    quantities: [
      { id: "ig-c-10", quantity: 10, providerCost: 2000, suggestedPrice: 6000, active: true },
      { id: "ig-c-20", quantity: 20, providerCost: 3800, suggestedPrice: 11000, active: true },
      { id: "ig-c-50", quantity: 50, providerCost: 8000, suggestedPrice: 25000, active: true },
      { id: "ig-c-100", quantity: 100, providerCost: 15000, suggestedPrice: 45000, active: true }
    ]
  },

  // FACEBOOK
  {
    id: "fb-followers",
    socialNetworkId: "facebook",
    name: "Seguidores",
    quantities: [
      { id: "fb-f-1000", quantity: 1000, providerCost: 6000, suggestedPrice: 15000, active: true },
      { id: "fb-f-2000", quantity: 2000, providerCost: 11000, suggestedPrice: 28000, active: true },
      { id: "fb-f-5000", quantity: 5000, providerCost: 25000, suggestedPrice: 65000, active: true },
      { id: "fb-f-10000", quantity: 10000, providerCost: 45000, suggestedPrice: 120000, active: true }
    ]
  },
  {
    id: "fb-likes",
    socialNetworkId: "facebook",
    name: "Likes de Página",
    quantities: [
      { id: "fb-l-1000", quantity: 1000, providerCost: 3000, suggestedPrice: 8000, active: true },
      { id: "fb-l-2000", quantity: 2000, providerCost: 5500, suggestedPrice: 15000, active: true },
      { id: "fb-l-5000", quantity: 5000, providerCost: 12000, suggestedPrice: 32000, active: true },
      { id: "fb-l-10000", quantity: 10000, providerCost: 22000, suggestedPrice: 60000, active: true }
    ]
  },
  {
    id: "fb-views",
    socialNetworkId: "facebook",
    name: "Vistas",
    quantities: [
      { id: "fb-v-10000", quantity: 10000, providerCost: 4000, suggestedPrice: 12000, active: true },
      { id: "fb-v-20000", quantity: 20000, providerCost: 7500, suggestedPrice: 22000, active: true },
      { id: "fb-v-50000", quantity: 50000, providerCost: 16000, suggestedPrice: 50000, active: true },
      { id: "fb-v-100000", quantity: 100000, providerCost: 30000, suggestedPrice: 90000, active: true }
    ]
  },
  {
    id: "fb-comments",
    socialNetworkId: "facebook",
    name: "Comentarios",
    quantities: [
      { id: "fb-c-10", quantity: 10, providerCost: 2000, suggestedPrice: 6000, active: true },
      { id: "fb-c-20", quantity: 20, providerCost: 3800, suggestedPrice: 11000, active: true },
      { id: "fb-c-50", quantity: 50, providerCost: 8000, suggestedPrice: 25000, active: true },
      { id: "fb-c-100", quantity: 100, providerCost: 15000, suggestedPrice: 45000, active: true }
    ]
  },

  // TIKTOK
  {
    id: "tt-followers",
    socialNetworkId: "tiktok",
    name: "Seguidores",
    quantities: [
      { id: "tt-f-1000", quantity: 1000, providerCost: 6000, suggestedPrice: 15000, active: true },
      { id: "tt-f-2000", quantity: 2000, providerCost: 11000, suggestedPrice: 28000, active: true },
      { id: "tt-f-5000", quantity: 5000, providerCost: 25000, suggestedPrice: 65000, active: true },
      { id: "tt-f-10000", quantity: 10000, providerCost: 45000, suggestedPrice: 120000, active: true }
    ]
  },
  {
    id: "tt-likes",
    socialNetworkId: "tiktok",
    name: "Likes",
    quantities: [
      { id: "tt-l-1000", quantity: 1000, providerCost: 3000, suggestedPrice: 8000, active: true },
      { id: "tt-l-2000", quantity: 2000, providerCost: 5500, suggestedPrice: 15000, active: true },
      { id: "tt-l-5000", quantity: 5000, providerCost: 12000, suggestedPrice: 32000, active: true },
      { id: "tt-l-10000", quantity: 10000, providerCost: 22000, suggestedPrice: 60000, active: true }
    ]
  },
  {
    id: "tt-views",
    socialNetworkId: "tiktok",
    name: "Vistas",
    quantities: [
      { id: "tt-v-10000", quantity: 10000, providerCost: 4000, suggestedPrice: 12000, active: true },
      { id: "tt-v-20000", quantity: 20000, providerCost: 7500, suggestedPrice: 22000, active: true },
      { id: "tt-v-50000", quantity: 50000, providerCost: 16000, suggestedPrice: 50000, active: true },
      { id: "tt-v-100000", quantity: 100000, providerCost: 30000, suggestedPrice: 90000, active: true }
    ]
  },
  {
    id: "tt-comments",
    socialNetworkId: "tiktok",
    name: "Comentarios",
    quantities: [
      { id: "tt-c-10", quantity: 10, providerCost: 2000, suggestedPrice: 6000, active: true },
      { id: "tt-c-20", quantity: 20, providerCost: 3800, suggestedPrice: 11000, active: true },
      { id: "tt-c-50", quantity: 50, providerCost: 8000, suggestedPrice: 25000, active: true },
      { id: "tt-c-100", quantity: 100, providerCost: 15000, suggestedPrice: 45000, active: true }
    ]
  },

  // YOUTUBE
  {
    id: "yt-subscribers",
    socialNetworkId: "youtube",
    name: "Suscriptores",
    quantities: [
      { id: "yt-s-100", quantity: 100, providerCost: 10000, suggestedPrice: 25000, active: true },
      { id: "yt-s-200", quantity: 200, providerCost: 18500, suggestedPrice: 45000, active: true },
      { id: "yt-s-500", quantity: 500, providerCost: 42000, suggestedPrice: 100000, active: true },
      { id: "yt-s-1000", quantity: 1000, providerCost: 80000, suggestedPrice: 180000, active: true }
    ]
  },
  {
    id: "yt-likes",
    socialNetworkId: "youtube",
    name: "Likes",
    quantities: [
      { id: "yt-l-1000", quantity: 1000, providerCost: 5000, suggestedPrice: 12000, active: true },
      { id: "yt-l-2000", quantity: 2000, providerCost: 9000, suggestedPrice: 22000, active: true },
      { id: "yt-l-5000", quantity: 5000, providerCost: 20000, suggestedPrice: 50000, active: true },
      { id: "yt-l-10000", quantity: 10000, providerCost: 38000, suggestedPrice: 90000, active: true }
    ]
  },
  {
    id: "yt-views",
    socialNetworkId: "youtube",
    name: "Vistas",
    quantities: [
      { id: "yt-v-1000", quantity: 1000, providerCost: 4000, suggestedPrice: 10000, active: true },
      { id: "yt-v-2000", quantity: 2000, providerCost: 7500, suggestedPrice: 18000, active: true },
      { id: "yt-v-5000", quantity: 5000, providerCost: 17000, suggestedPrice: 40000, active: true },
      { id: "yt-v-10000", quantity: 10000, providerCost: 32000, suggestedPrice: 75000, active: true }
    ]
  },
  {
    id: "yt-comments",
    socialNetworkId: "youtube",
    name: "Comentarios",
    quantities: [
      { id: "yt-c-10", quantity: 10, providerCost: 3000, suggestedPrice: 8000, active: true },
      { id: "yt-c-20", quantity: 20, providerCost: 5500, suggestedPrice: 15000, active: true },
      { id: "yt-c-50", quantity: 50, providerCost: 12000, suggestedPrice: 32000, active: true },
      { id: "yt-c-100", quantity: 100, providerCost: 22000, suggestedPrice: 60000, active: true }
    ]
  }
];
