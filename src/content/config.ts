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
  }),
});

const appsCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    platform: z.array(z.enum(['iOS', 'Android', 'Web', 'macOS', 'Windows', 'Linux'])),
    downloadLink: z.string().optional(),
  }),
});

const websitesCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    url: z.string().url(),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
  apps: appsCollection,
  websites: websitesCollection,
};