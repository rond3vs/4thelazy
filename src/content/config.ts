// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    type: z.string(),
    isSponsored: z.boolean().default(false),
  }),
});

const productsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(), 
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()),
    affiliateLink: z.string(),
    price: z.number().optional(),
    currency: z.string().default('USD'),
    rating: z.number().optional(),
    isSponsored: z.boolean().default(false),
  }),
});

const appsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()),
    platform: z.array(z.enum(['iOS', 'Android', 'Web', 'macOS', 'Windows', 'Linux'])),
    price: z.number().optional(),
    currency: z.string().default('USD'),
    isFreemium: z.boolean().default(false),
    hasSubscription: z.boolean().default(false),
    version: z.string().optional(),
    developer: z.string().optional(),
    rating: z.number().optional(),
    downloadLink: z.string().optional(),
    isSponsored: z.boolean().default(false),
  }),
});

const websitesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    url: z.string().url(),
    categories: z.array(z.string()),
    technologies: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    hasFreeTier: z.boolean().default(false),
    hasPaidPlan: z.boolean().default(false),
    monthlyPrice: z.number().optional(),
    currency: z.string().default('USD'),
    rating: z.number().optional(),
    isSponsored: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
  apps: appsCollection,
  websites: websitesCollection,
};