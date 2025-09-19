#!/usr/bin/env node

/**
 * Amazon PA-API Product Fetcher for Astro Content Collections
 * 
 * Usage: node scripts/fetch-products.js <ASIN1> <ASIN2> ...
 * Example: node scripts/fetch-products.js B08N5WRWNW B07ZPKN6YR
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually (or use dotenv/config)
import 'dotenv/config';

// Configuration
const CONFIG = {
  accessKey: process.env.AMAZON_PAAPI_ACCESS_KEY,
  secretKey: process.env.AMAZON_PAAPI_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  host: process.env.AMAZON_PAAPI_HOST || 'webservices.amazon.com',
  region: process.env.AMAZON_PAAPI_REGION || 'us-east-1',
  marketplace: process.env.AMAZON_PAAPI_MARKETPLACE || 'www.amazon.com',
  outputDir: path.resolve(process.cwd(), 'src/content/products')
};

// Validate required environment variables
const requiredEnvVars = ['accessKey', 'secretKey', 'partnerTag'];
for (const key of requiredEnvVars) {
  if (!CONFIG[key]) {
    console.error(`❌ Missing required environment variable: AMAZON_PAAPI_${key.toUpperCase()}`);
    process.exit(1);
  }
}

/**
 * AWS Signature Version 4 signing for PA-API
 */
class AWSSignatureV4 {
  constructor(accessKey, secretKey, region, service) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = region;
    this.service = service;
  }

  sign(method, url, headers, body) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const uri = urlObj.pathname;
    const querystring = urlObj.search.slice(1);

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    // Normalize headers for PA-API
    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value.toString().trim();
    }
    
    // Add required AWS headers
    normalizedHeaders['host'] = host;
    normalizedHeaders['x-amz-date'] = amzDate;

    // Create canonical headers string
    const sortedHeaderKeys = Object.keys(normalizedHeaders).sort();
    const canonicalHeaders = sortedHeaderKeys
      .map(key => `${key}:${normalizedHeaders[key]}\n`)
      .join('');

    const signedHeaders = sortedHeaderKeys.join(';');

    // Create payload hash
    const payloadHash = crypto.createHash('sha256').update(body || '', 'utf8').digest('hex');

    // Create canonical request
    const canonicalRequest = [
      method.toUpperCase(),
      uri,
      querystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')
    ].join('\n');

    // Calculate signature
    const signingKey = this.getSignatureKey(dateStamp);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    // Create authorization header
    const authorization = `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Return all headers including the computed ones
    const finalHeaders = {
      ...headers,  // Original headers with original casing
      'Host': host,
      'X-Amz-Date': amzDate,
      'Authorization': authorization
    };

    return finalHeaders;
  }

  getSignatureKey(dateStamp) {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(dateStamp, 'utf8').digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region, 'utf8').digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.service, 'utf8').digest();
    return crypto.createHmac('sha256', kService).update('aws4_request', 'utf8').digest();
  }
}

/**
 * Amazon PA-API Client
 */
class AmazonPAAPIClient {
  constructor(config) {
    this.config = config;
    this.signer = new AWSSignatureV4(
      config.accessKey,
      config.secretKey,
      config.region,
      'ProductAdvertisingAPI'
    );
  }

  async getItems(asins) {
    const url = `https://${this.config.host}/paapi5/getitems`;
    
    const requestBody = {
      PartnerTag: this.config.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.config.marketplace,
      ItemIds: asins,
      Resources: [
        'Images.Primary.Medium',
        'Images.Primary.Large', 
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.Classifications',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message'
      ]
    };

    const body = JSON.stringify(requestBody);
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Encoding': 'amz-1.0',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
    };

    const signedHeaders = this.signer.sign('POST', url, headers, body);

    try {
      console.log(`🔄 Fetching ${asins.length} product(s) from Amazon PA-API...`);
      
      // Debug logging (remove after testing)
      console.log('🔍 Request details:');
      console.log('  URL:', url);
      console.log('  Method: POST');
      console.log('  Body length:', body.length);
      console.log('  Authorization header:', signedHeaders.Authorization?.slice(0, 50) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Full error response:', errorText);
        throw new Error(`PA-API request failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      
      if (data.Errors && data.Errors.length > 0) {
        console.warn('⚠️  PA-API returned errors:', data.Errors);
      }

      return data.ItemsResult?.Items || [];
    } catch (error) {
      console.error('❌ PA-API request failed:', error.message);
      throw error;
    }
  }
}

/**
 * Utility functions
 */
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function formatPrice(amount, currency = 'USD') {
  if (typeof amount !== 'number') return null;
  return (amount / 100).toFixed(2); // PA-API returns price in cents
}

function extractFeatures(item) {
  const features = item?.ItemInfo?.Features?.DisplayValues;
  return features ? features.slice(0, 3) : []; // Take first 3 features
}

function generateProductMarkdown(item) {
  const asin = item?.ASIN || '';
  const title = item?.ItemInfo?.Title?.DisplayValue || 'Untitled Product';
  const image = item?.Images?.Primary?.Large?.URL || item?.Images?.Primary?.Medium?.URL || '';
  
  // Price information (updated for correct API structure)
  const listing = item?.Offers?.Listings?.[0];
  const priceAmount = listing?.Price?.Amount;
  const currency = listing?.Price?.Currency || 'USD';
  const availability = listing?.Availability?.Message || '';
  
  const url = item?.DetailPageURL || '';
  const productGroup = item?.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || '';
  const features = extractFeatures(item);

  const slug = slugify(`${title}-${asin}`);
  const pubDate = new Date().toISOString().split('T')[0];
  const formattedPrice = formatPrice(priceAmount, currency);

  // Generate description from features
  const description = features.length > 0 
    ? features.slice(0, 2).join('. ') + '.'
    : `${title} available on Amazon.`;

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `pubDate: ${pubDate}`,
    `affiliateLink: ${JSON.stringify(url)}`,
    formattedPrice ? `price: ${formattedPrice}` : null,
    `currency: ${JSON.stringify(currency)}`,
    `asin: ${JSON.stringify(asin)}`,
    `productGroup: ${JSON.stringify(productGroup)}`,
    `availability: ${JSON.stringify(availability)}`,
    `tags: [${JSON.stringify(productGroup.toLowerCase())}]`,
    `isSponsored: true`,
    `draft: false`,
    image ? `image: ${JSON.stringify(image)}` : null,
    features.length > 0 ? `features: ${JSON.stringify(features)}` : null,
    '---',
    '',
    `## ${title}`,
    '',
    description,
    '',
    features.length > 0 ? '### Key Features:' : null,
    features.length > 0 ? features.map(f => `- ${f}`).join('\n') : null,
    features.length > 0 ? '' : null,
    `**ASIN:** ${asin}`,
    availability ? `**Availability:** ${availability}` : null,
    ''
  ].filter(line => line !== null).join('\n');

  return { slug, content: frontmatter };
}

/**
 * Main execution
 */
async function main() {
  const asins = process.argv.slice(2).filter(Boolean);
  
  if (asins.length === 0) {
    console.log(`
📦 Amazon PA-API Product Fetcher for Astro

Usage: node ${path.basename(process.argv[1])} <ASIN1> <ASIN2> ...

Example:
  node ${path.basename(process.argv[1])} B08N5WRWNW B07ZPKN6YR B09JQVH4KY

This will fetch product data from Amazon and create .md files in:
  ${CONFIG.outputDir}
`);
    process.exit(0);
  }

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`📁 Created directory: ${CONFIG.outputDir}`);
  }

  const client = new AmazonPAAPIClient(CONFIG);
  
  // Process ASINs in batches of 10 (PA-API limit)
  const batchSize = 10;
  let totalProcessed = 0;
  let totalSuccess = 0;

  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, i + batchSize);
    
    try {
      const items = await client.getItems(batch);
      
      if (items.length === 0) {
        console.log(`⚠️  No items returned for batch: ${batch.join(', ')}`);
        continue;
      }

      for (const item of items) {
        try {
          const { slug, content } = generateProductMarkdown(item);
          const filename = `${slug}.md`;
          const filepath = path.join(CONFIG.outputDir, filename);
          
          fs.writeFileSync(filepath, content, 'utf8');
          
          console.log(`✅ Generated: ${filename}`);
          totalSuccess++;
        } catch (error) {
          console.error(`❌ Failed to generate markdown for ${item?.ASIN}:`, error.message);
        }
      }
      
      totalProcessed += batch.length;

      // Rate limiting: wait 1 second between batches
      if (i + batchSize < asins.length) {
        console.log('⏳ Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Batch failed for ASINs [${batch.join(', ')}]:`, error.message);
    }
  }

  console.log(`\n🎉 Processing complete!`);
  console.log(`   Total ASINs requested: ${asins.length}`);
  console.log(`   Files generated: ${totalSuccess}`);
  console.log(`   Output directory: ${CONFIG.outputDir}`);
  
  if (totalSuccess > 0) {
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review the generated .md files`);
    console.log(`   2. Run your Astro dev server to see the products`);
    console.log(`   3. Update your Astro pages to display the product cards`);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});