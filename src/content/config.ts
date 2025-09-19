// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Common fields for all collections
const baseSchema = {
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  image: z.string().optional(),
  isSponsored: z.boolean().default(false),
  draft: z.boolean().default(false),
  tags: z.array(z.string())
 ,
};

const blogCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
  }),
});

const productsCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    affiliateLink: z.string(),

    // ✅ add these fields
    price: z.number().optional(),
    currency: z.string().default('USD').optional(),
    rating: z.number().min(0).max(5).optional(),
    asin: z.string().optional(),
    image: z.string().url().optional(),
    developer: z.string().optional(),
    version: z.string().optional(),
    isFreemium: z.boolean().optional(),
    hasSubscription: z.boolean().optional(),
  }),
});

const appsCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    platform: z.array(z.enum(['iOS', 'Android', 'Web', 'macOS', 'Windows', 'Linux'])),
    downloadLink: z.string().optional(),

    // ✅ add these to match your ItemGrid usage
    price: z.number().optional(),
    currency: z.string().default('USD').optional(),
    rating: z.number().min(0).max(5).optional(),
    developer: z.string().optional(),
    version: z.string().optional(),
    isFreemium: z.boolean().optional(),
    hasSubscription: z.boolean().optional(),
  }),
});

const websitesCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    url: z.string().url(),

    // 🔽 Add these
    currency: z.string().default('USD').optional(),
    rating: z.number().min(0).max(5).optional(),
    technologies: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    hasFreeTier: z.boolean().optional(),
    hasPaidPlan: z.boolean().optional(),
    monthlyPrice: z.number().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
  apps: appsCollection,
  websites: websitesCollection,
};