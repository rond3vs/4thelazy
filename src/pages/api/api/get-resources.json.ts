// File: src/pages/api/get-resources.json.js or src/pages/api/get-resources.json.ts
// This creates an Astro API endpoint for paginated resources

import { getCollection } from 'astro:content';

// API handler function
export async function GET({ request }: { request: Request }) {
  // Get URL params
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '9');
  const contentType = url.searchParams.get('contentType') || 'all';
  const tag = url.searchParams.get('tag') || 'all';
  const search = url.searchParams.get('search') || '';
  
  // Fetch all collections (you could optimize this with caching)
  const allBlogPosts = await getCollection('blog');
  const allProducts = await getCollection('products');
  
  // Sort by date - newest first
  const sortedBlogPosts = allBlogPosts.sort((a, b) => 
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  
  const sortedProducts = allProducts.sort((a, b) => {
    const dateA = a.data.pubDate || new Date();
    const dateB = b.data.pubDate || new Date();
    return dateB.valueOf() - dateA.valueOf();
  });
  
  // Function to get primary category (same as in your component)
  function getPrimaryCategory(data: any) {
    const type = (data.type || '').toLowerCase();
    const tags = (data.tags || data.categories || []).map((t: string) => t.toLowerCase());
    
    if (type.includes('app') || tags.includes('app')) return 'app';
    if (type.includes('website') || tags.includes('website')) return 'website';
    if (type.includes('blog') || tags.includes('blog')) return 'blog';
    if (type.includes('article')) return 'article';
    if (type.includes('product') || data.productType || data.price) return 'product';
    
    return 'article'; // fallback
  }
  
  // Convert collections to simplified resources
  let allResources = [
    ...sortedBlogPosts.map(post => {
      const primaryCategory = getPrimaryCategory(post.data);
      return {
        id: post.id,
        slug: post.slug,
        type: 'blog',
        primaryCategory,
        title: post.data.title,
        image: post.data.image || '/images/default-blog.png',
        description: post.data.description || '',
        tags: post.data.tags || [],
        isSponsored: post.data.isSponsored || false,
        date: post.data.pubDate.toISOString(),
        displayType: primaryCategory
      };
    }),
    ...sortedProducts.map(product => {
      const primaryCategory = getPrimaryCategory(product.data);
      return {
        id: product.id,
        slug: product.slug,
        type: 'product',
        primaryCategory,
        title: product.data.title,
        image: product.data.image || '/images/default-product.png',
        description: product.data.description || '',
        tags: product.data.categories || [],
        isSponsored: product.data.isSponsored || false,
        date: (product.data.pubDate || new Date()).toISOString(),
        displayType: primaryCategory
      };
    })
  ];
  
  // Apply content type filter
  if (contentType !== 'all') {
    allResources = allResources.filter(resource => 
      resource.primaryCategory.toLowerCase() === contentType.toLowerCase()
    );
  }
  
  // Apply tag filter
  if (tag !== 'all') {
    allResources = allResources.filter(resource => 
      resource.tags && resource.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }
  
  // Apply search filter (optional)
  if (search) {
    const searchLower = search.toLowerCase();
    allResources = allResources.filter(resource => 
      resource.title.toLowerCase().includes(searchLower) ||
      resource.description.toLowerCase().includes(searchLower) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Calculate pagination
  const totalItems = allResources.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get paged data
  const pagedResources = allResources.slice(startIndex, endIndex);
  
  // Return JSON response
  return new Response(JSON.stringify({
    resources: pagedResources,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      pageSize
    }
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}