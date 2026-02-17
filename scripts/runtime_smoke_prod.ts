// Runtime smoke test for Greasy-Chat production
// Tests P1: geocode + Event A (estimate_created) + Event B YES + Event B NO

const PROD_DOMAIN = 'https://www.larestaurantservices.com';

interface GeocodeResponse {
  verified: boolean;
  lat?: number;
  lng?: number;
  normalizedAddress?: string;
  error?: string;
}

interface EstimateResponse {
  ok: boolean;
  error?: string;
  [key: string]: any;
}

async function main() {
  console.log('=== GREASY-CHAT P1 AUTOMATED SMOKE TEST ===');
  console.log(`Domain: ${PROD_DOMAIN}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // 1. TEST GEOCODE
    console.log('[1/5] Testing /api/geocode...');
    const geoRes = await fetch(`${PROD_DOMAIN}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addressLine1: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
      }),
    });

    const geoData: GeocodeResponse = await geoRes.json();
    console.log(`Status: ${geoRes.status}`);
    console.log(`Response:`, JSON.stringify(geoData, null, 2));

    if (!geoRes.ok || !geoData.verified || typeof geoData.lat !== 'number' || typeof geoData.lng !== 'number') {
      throw new Error('Geocode FAIL: not verified or missing lat/lng');
    }
    console.log('✅ Geocode PASS\n');

    const { lat, lng } = geoData;

    // 2. TEST EVENT A (estimate_created) - GREASE_4000 tier
    console.log('[2/5] Testing Event A (estimate_created)...');
    const quoteIdA = `smoke-${Date.now()}`;
    const eventAPayload = {
      intake: {
        business_name: 'QA Smoke Test',
        address_line: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        system_type: 'GREASE_TRAP',
        gallons: '3000',
        frequency: 'monthly',
      },
      contact: {
        email: 'qa-smoke@example.com',
        full_name: 'QA Smoke',
        phone: '555-0100',
      },
      estimate: {
        baseServiceLabel: 'Grease Trap - 3000 gallons',
        baseServicePrice: 0,
        totalPrice: 0,
        distanceVerified: true,
        distanceMiles: 10,
        tierUsed: 'GREASE_4000',
        radiusBand: '0-10',
      },
      meta: {
        leadEvent: 'estimate_created',
        quoteId: quoteIdA,
        source: 'automated-smoke-test',
        createdAt: new Date().toISOString(),
      },
    };

    const eventARes = await fetch(`${PROD_DOMAIN}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventAPayload),
    });

    const eventAData: EstimateResponse = await eventARes.json();
    console.log(`Status: ${eventARes.status}`);
    console.log(`Response:`, JSON.stringify(eventAData, null, 2));

    if (!eventARes.ok || !eventAData.ok) {
      console.log('❌ Event A FAIL');
    } else {
      console.log(`✅ Event A PASS (quoteId: ${quoteIdA})\n`);
    }

    // 3. TEST EVENT B YES (move_forward_decided, wants_to_move_forward: true)
    console.log('[3/5] Testing Event B YES (move_forward_decided, wants_to_move_forward: true)...');
    const eventBYesPayload = {
      ...eventAPayload,
      intake: {
        ...eventAPayload.intake,
        wants_to_move_forward: true,
      },
      meta: {
        leadEvent: 'move_forward_decided',
        quoteId: quoteIdA,
        source: 'automated-smoke-test',
        createdAt: new Date().toISOString(),
      },
    };

    const eventBYesRes = await fetch(`${PROD_DOMAIN}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventBYesPayload),
    });

    const eventBYesData: EstimateResponse = await eventBYesRes.json();
    console.log(`Status: ${eventBYesRes.status}`);
    console.log(`Response:`, JSON.stringify(eventBYesData, null, 2));

    if (!eventBYesRes.ok || !eventBYesData.ok) {
      console.log('❌ Event B YES FAIL');
    } else {
      console.log(`✅ Event B YES PASS (quoteId: ${quoteIdA})\n`);
    }

    // 4. TEST EVENT B NO (move_forward_decided, wants_to_move_forward: false)
    console.log('[4/5] Testing Event B NO (move_forward_decided, wants_to_move_forward: false)...');
    const quoteIdNO = `smoke-no-${Date.now()}`;
    
    // First create Event A for NO flow
    const eventANoPayload = {
      ...eventAPayload,
      contact: {
        email: 'qa-smoke-no@example.com',
        full_name: 'QA Smoke NO',
        phone: '555-0200',
      },
      meta: {
        leadEvent: 'estimate_created',
        quoteId: quoteIdNO,
        source: 'automated-smoke-test',
        createdAt: new Date().toISOString(),
      },
    };

    const eventANoRes = await fetch(`${PROD_DOMAIN}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventANoPayload),
    });

    const eventANoData: EstimateResponse = await eventANoRes.json();
    console.log(`Event A NO Status: ${eventANoRes.status}`);
    console.log(`Event A NO Response:`, JSON.stringify(eventANoData, null, 2));

    // Then Event B NO
    const eventBNoPayload = {
      ...eventANoPayload,
      intake: {
        ...eventANoPayload.intake,
        wants_to_move_forward: false,
      },
      meta: {
        leadEvent: 'move_forward_decided',
        quoteId: quoteIdNO,
        source: 'automated-smoke-test',
        createdAt: new Date().toISOString(),
      },
    };

    const eventBNoRes = await fetch(`${PROD_DOMAIN}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventBNoPayload),
    });

    const eventBNoData: EstimateResponse = await eventBNoRes.json();
    console.log(`Event B NO Status: ${eventBNoRes.status}`);
    console.log(`Event B NO Response:`, JSON.stringify(eventBNoData, null, 2));

    if (!eventBNoRes.ok || !eventBNoData.ok) {
      console.log('❌ Event B NO FAIL');
    } else {
      console.log(`✅ Event B NO PASS (quoteId: ${quoteIdNO})\n`);
    }

    // 5. SUMMARY
    console.log('[5/5] SUMMARY');
    console.log('─'.repeat(60));
    console.log(`Domain tested: ${PROD_DOMAIN}`);
    console.log(`Geocode: ✅ PASS (lat: ${lat}, lng: ${lng})`);
    console.log(`Event A (estimate_created): ${eventAData.ok ? '✅ PASS' : '❌ FAIL'} (quoteId: ${quoteIdA})`);
    console.log(`Event B YES: ${eventBYesData.ok ? '✅ PASS' : '❌ FAIL'} (quoteId: ${quoteIdA})`);
    console.log(`Event B NO: ${eventBNoData.ok ? '✅ PASS' : '❌ FAIL'} (quoteId: ${quoteIdNO})`);
    console.log('─'.repeat(60));
    console.log('\n✅ P1 AUTOMATED SMOKE TEST COMPLETE');

  } catch (err: any) {
    console.error('\n❌ SMOKE TEST FAILED:');
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
