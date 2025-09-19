// src/pages/api/paapi/[asin].ts
import type { APIRoute } from 'astro';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Normalize the CJS export shape
const PAraw = require('amazon-paapi5');
const PA = PAraw?.default ?? PAraw;

const ApiClient        = PA.ApiClient;
const DefaultApi       = PA.DefaultApi;
const GetItemsRequest  = PA.GetItemsRequest;
const GetItemsResponse = PA.GetItemsResponse;

export const GET: APIRoute = async ({ params }) => {
  const asin = params.asin;
  if (!asin) return new Response(JSON.stringify({ error: 'missing asin' }), { status: 400 });

  // Read from runtime env (don’t leak via PUBLIC_*)
  const ACCESS_KEY  = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const SECRET_KEY  = process.env.AMAZON_PAAPI_SECRET_KEY;
  const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG;

  if (!ACCESS_KEY || !SECRET_KEY || !PARTNER_TAG) {
    return new Response(JSON.stringify({ error: 'server not configured' }), { status: 500 });
  }

  // PA-API client
  const c = ApiClient.instance;
  c.accessKey = ACCESS_KEY;
  c.secretKey = SECRET_KEY;
  c.host = 'webservices.amazon.com';
  c.region = 'us-east-1';
  const api = new DefaultApi();

  const req = new GetItemsRequest();
  req.PartnerTag = PARTNER_TAG;
  req.PartnerType = 'Associates';
  req.Marketplace = 'www.amazon.com';
  req.ItemIds = [asin];
  req.Resources = ['Images.Primary.Medium', 'ItemInfo.Title', 'OffersV2.Listings.Price'];

  try {
    const data = await api.getItems(req);
    const res = GetItemsResponse.constructFromObject(data);
    const item = res?.ItemsResult?.Items?.[0];
    if (!item) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });

    const payload = {
      asin,
      title: item.ItemInfo?.Title?.DisplayValue ?? null,
      image: item.Images?.Primary?.Medium?.URL ?? null,
      price: item.OffersV2?.Listings?.[0]?.Price?.Money?.DisplayAmount ?? null,
      affiliateLink: item.DetailPageURL ?? null,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=86400', // CDN-friendly
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: true, message: e?.message }), { status: 500 });
  }
};