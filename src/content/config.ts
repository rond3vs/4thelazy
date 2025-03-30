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
};

const blogCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    tags: z.array(z.string()),
    type: z.string(), // additional blog-specific field
  }),
});

const productsCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    tags: z.array(z.string()),
    affiliateLink: z.string(),
  }),
});

const appsCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    platform: z.array(z.enum(['iOS', 'Android', 'Web', 'macOS', 'Windows', 'Linux'])),
    downloadLink: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

const websitesCollection = defineCollection({
  schema: z.object({
    ...baseSchema,
    url: z.string().url(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
  apps: appsCollection,
  websites: websitesCollection,
};