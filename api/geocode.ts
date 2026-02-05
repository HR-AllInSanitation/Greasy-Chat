import { Redis } from '@upstash/redis';

// Server-side geocoding endpoint using Google Geocoding API
// DO NOT expose GOOGLE_MAPS_API_KEY to client

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.warn('GOOGLE_MAPS_API_KEY not set; geocoding disabled');
    return res.status(200).json({ verified: false, error: 'Geocoding not configured' });
  }

  const { address, addressLine1, city, state, zip } = req.body || {};
  let fullAddress = '';

  if (address && typeof address === 'string') {
    fullAddress = address.trim();
  } else if (addressLine1 || city || state || zip) {
    const parts = [addressLine1, city, state, zip].filter(Boolean).map(s => String(s).trim());
    fullAddress = parts.join(', ');
  }

  if (!fullAddress) {
    return res.status(400).json({ error: 'Missing address' });
  }

  // Normalize for cache key
  const cacheKey = `greasy:geocode:${fullAddress.toLowerCase().replace(/\s+/g, ' ')}`;

  // Check cache (optional but recommended)
  let redis: Redis | null = null;
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      redis = new Redis({ url: redisUrl, token: redisToken });
      const cached = await redis.get(cacheKey);
      if (cached && typeof cached === 'object') {
        return res.status(200).json({ ...cached, cached: true });
      }
    }
  } catch (err) {
    console.warn('Redis cache check failed:', err);
  }

  // Call Google Geocoding API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

  try {
    const geoRes = await fetch(url);
    const data = await geoRes.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return res.status(200).json({ verified: false, error: data.status || 'No results' });
    }

    const result = data.results[0];
    const location = result.geometry?.location;
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(200).json({ verified: false, error: 'Invalid location data' });
    }

    const response = {
      verified: true,
      lat: location.lat,
      lng: location.lng,
      normalizedAddress: result.formatted_address || fullAddress,
    };

    // Cache result
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(response), { ex: 86400 * 30 }); // 30 days
      } catch (err) {
        console.warn('Redis cache write failed:', err);
      }
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('Geocoding API error:', err);
    return res.status(500).json({ verified: false, error: err.message || 'Geocoding failed' });
  }
}
