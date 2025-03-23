// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define a schema for blog posts
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Use a consistent date field name across collections
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    type: z.string(),
    isSponsored: z.boolean().default(false),
  }),
});

// Define a schema for products
const productsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Use the same date field name as in the blog collection
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    // Use categories instead of tags for products (if that's your preference)
    categories: z.array(z.string()),
    // Additional product-specific fields
    price: z.number().optional(),
    currency: z.string().default('USD'),
    inStock: z.boolean().default(true),
    // Keep the isSponsored field for consistency
    isSponsored: z.boolean().default(false),
  }),
});

// Export the collections
export const collections = {
  'blog': blogCollection,
  'products': productsCollection,
};