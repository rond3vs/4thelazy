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
    price: z.number().optional(),
    currency: z.string().default('USD'),
    inStock: z.boolean().default(true),
    isSponsored: z.boolean().default(false),
    // Add productType field
    productType: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
};