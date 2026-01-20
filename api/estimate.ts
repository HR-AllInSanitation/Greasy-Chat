
// Minimal buildId: hardcoded short string (update as needed)
const BUILD_ID = 'DEV20260119';

// pdf-lib is imported dynamically only when needed
import { setTimeout as nodeSetTimeout } from 'timers/promises';

export const config = { runtime: 'nodejs' };

const sendCustomerEmail = async (payload: any) => {
  const { intake, contact, estimate, pdfBytes } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
  const to = contact?.email || contact?.contact_email;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping transactional email');
    return;
  }
  if (!to) {
    console.warn('Contact email missing; skipping transactional email');
    return;
  }

  const manualQuote = estimate?.manualQuote === true;
  const rawAmount = manualQuote
    ? null
    : typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
  const amount = manualQuote
    ? 'Manual review required'
    : typeof rawAmount === 'number'
      ? `$${rawAmount.toFixed(2)}`
      : String(rawAmount ?? '');
  const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
  const address = addressParts.join(', ');
  const disclaimer = 'This estimate is a preliminary range and is subject to verification by our operations team. Final pricing may vary based on on-site conditions and job requirements, including but not limited to additional hose length, actual waste volume, access constraints, blockages, hydro-jetting needs, or other services required to properly complete the work.';
  const cta = intake?.wants_to_move_forward === true
    ? 'Our office will reach out to you shortly to move forward.'
    : 'Reply to this email if you would like to move forward.';

  const text = [
    `Business: ${intake?.business_name || 'N/A'}`,
    `Address: ${address || 'N/A'}`,
    `Estimate: ${amount || 'N/A'}${estimate?.ballpark ? ' (ballpark)' : ''}`,
    '',
    disclaimer,
    '',
    cta,
  ].join('\n');

  try {
    const attachments = pdfBytes
      ? [{ filename: 'Estimate.pdf', content: Buffer.from(pdfBytes).toString('base64') }]
      : undefined;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Your Grease Trap Service Estimate',
        text,
        attachments,
      }),
    });

    if (!resp.ok) {
      console.error('Resend email failed', resp.status, await resp.text());
    }
  } catch (err: any) {
    console.error('Resend email error', err?.message || err);
  }
};

const sendHqEmail = async (payload: any) => {
  const { intake, contact, estimate, pdfBytes } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
  const to = (process.env.HQ_LEADS_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping HQ email');
    return;
  }
  if (to.length === 0) {
    console.warn('HQ_LEADS_EMAILS missing or empty; skipping HQ email');
    return;
  }

  const manualQuote = estimate?.manualQuote === true;
  const rawAmount = manualQuote
    ? null
    : typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
  const amount = manualQuote
    ? 'Manual review required'
    : typeof rawAmount === 'number'
      ? `$${rawAmount.toFixed(2)}`
      : String(rawAmount ?? '');
  const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
  const address = addressParts.join(', ');
  const isReady = intake?.wants_to_move_forward === true;
  const distanceMiles = estimate?.distanceMiles ?? estimate?.distance;
  const distanceSource = estimate?.distanceSource;
  const assumptions = Array.isArray(estimate?.assumptions) ? estimate.assumptions : [];
  const radiusBand = estimate?.radiusBand || (estimate as any)?.radius_band;
  const distanceAssumed = estimate?.distanceAssumed;
  const tierUsed = estimate?.tierUsed;
  const capacityTier = (estimate as any)?.capacity_tier || tierUsed;
  const capacityUnsure = (estimate as any)?.capacity_unsure === true || estimate?.gallonsUncertain === true;
  const addOnsRaw = Array.isArray(estimate?.addOns) ? estimate.addOns : Array.isArray((estimate as any)?.add_ons) ? (estimate as any).add_ons : [];
  const addOns = addOnsRaw as { name: string; price: number }[];
  const unknownAddOns = Array.isArray(estimate?.unknownAddOns) ? estimate.unknownAddOns : [];
  const manualQuoteFlag = manualQuote || (estimate as any)?.manual_quote === true;
  const subject = isReady
    ? `🔥 NEW LEAD – Ready to Move Forward – ${intake?.business_name || 'Unknown'}`
    : `New Estimate Request – ${intake?.business_name || 'Unknown'}`;

  const text = [
    isReady
      ? 'ACTION: Contact customer to schedule service.'
      : 'ACTION: Follow up if customer decides to move forward.',
    '',
    'Business',
    `- Name: ${intake?.business_name || 'N/A'}`,
    `- Address: ${address || 'N/A'}`,
    '',
    'Estimate',
    `- Amount: ${amount || 'N/A'}${estimate?.ballpark ? ' (ballpark)' : ''}`,
    distanceMiles ? `- Distance: ${distanceMiles} mi${distanceSource ? ` (${distanceSource})` : ''}` : '',
    radiusBand ? `- Radius Band: ${radiusBand}` : '',
    distanceAssumed ? '- Distance Assumed: yes' : '',
    capacityTier ? `- Capacity Tier: ${capacityTier}` : '',
    capacityUnsure ? '- Capacity Unsure: yes (defaulted to up to 1,600)' : '',
    tierUsed ? `- Tier Used: ${tierUsed}` : '',
    addOns.length ? `- Add-ons: ${addOns.map(a => `${a.name} ($${a.price})`).join(', ')}` : '',
    unknownAddOns.length ? `- Unrecognized add-ons: ${unknownAddOns.join(', ')}` : '',
    manualQuoteFlag ? '- Manual Quote: REQUIRED' : '',
    assumptions.length ? `- Assumptions: ${assumptions.join(' ')}` : '',
    '',
    'Intake Details',
    `- Gallons: ${intake?.gallons ?? 'N/A'}`,
    `- Parking Distance: ${intake?.parking_distance ?? 'N/A'}`,
    `- Last Cleaned: ${intake?.last_cleaned_at ?? 'N/A'}`,
    `- Needs UCO: ${intake?.needs_uco !== undefined ? String(intake.needs_uco) : 'N/A'}`,
    '',
    'Contact',
    `- Name: ${contact?.name || contact?.contact_name || 'N/A'}`,
    `- Phone: ${contact?.phone || contact?.contact_phone || 'N/A'}`,
    `- Email: ${contact?.email || contact?.contact_email || 'N/A'}`,
    '',
    `Move Forward Intent: ${isReady ? 'Yes' : 'No/Unspecified'}`,
  ].join('\n');

  try {
    const attachments = pdfBytes
      ? [{ filename: 'Estimate.pdf', content: Buffer.from(pdfBytes).toString('base64') }]
      : undefined;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        attachments,
      }),
    });

    if (!resp.ok) {
      console.error('Resend HQ email failed', resp.status, await resp.text());
    }
  } catch (err: any) {
    console.error('Resend HQ email error', err?.message || err);
  }
};

const generateEstimatePdf = async (payload: any) => {
  const { intake, contact, estimate, source, createdAt } = payload || {};
  try {
    // Dynamically import pdf-lib only when needed
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = 760;
    const lineHeight = 18;

    const drawText = (text: string, options: { bold?: boolean } = {}) => {
      const usedFont = options.bold ? fontBold : font;
      page.drawText(text, { x: 40, y, size: 12, font: usedFont, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    };

    drawText('Grease Trap Service Estimate', { bold: true });
    drawText(`Date: ${createdAt || new Date().toISOString()}`);
    drawText(`Source: ${source || 'greasy-agent'}`);
    y -= 8;

    drawText('Business Information', { bold: true });
    drawText(`Business: ${intake?.business_name || 'N/A'}`);
    const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean).join(', ');
    drawText(`Address: ${addressParts || 'N/A'}`);
    y -= 8;

    drawText('Estimate', { bold: true });
    const rawAmount = typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
    const amount = typeof rawAmount === 'number' ? `$${rawAmount.toFixed(2)}` : String(rawAmount ?? 'N/A');
    drawText(`Amount (estimate): ${amount}`);
    if (estimate?.ballpark) {
      drawText('Note: This is a ballpark estimate pending confirmation.');
    }
    y -= 8;

    drawText('Intake Details', { bold: true });
    drawText(`Gallons: ${intake?.gallons ?? 'N/A'}`);
    drawText(`Parking Distance: ${intake?.parking_distance ?? 'N/A'}`);
    if (intake?.needs_uco !== undefined) drawText(`Needs UCO: ${String(intake.needs_uco)}`);
    if (intake?.last_cleaned_at) drawText(`Last Cleaned: ${intake.last_cleaned_at}`);
    if (intake?.system_type) drawText(`System Type: ${intake.system_type}`);
    y -= 8;

    drawText('Estimate Disclaimer', { bold: true });
    const disclaimer = 'This estimate represents an initial price range based on the information provided and is subject to verification by headquarters prior to service. Final pricing may vary depending on on-site conditions such as hose length, actual waste volume, access limitations, system condition, blockages, hydro-jetting requirements, or any additional labor or equipment necessary to safely and properly complete the job.';
    const disclaimerLines = disclaimer.match(/.{1,90}(\s|$)/g) || [disclaimer];
    disclaimerLines.forEach(line => drawText(line.trim()));

    const pdfBytes = await pdfDoc.save();
    console.log('Generated estimate PDF bytes length', pdfBytes.length, 'for', contact?.email || 'unknown');
    return pdfBytes;
  } catch (err: any) {
    console.error('PDF generation failed', err?.message || err);
    return null;
  }
};

// Minimal serverless endpoint to receive completed chat estimates (Web Fetch API compatible).
export default async function handler(req: any, res: any) {
  const runtimeHint = 'nodejs';
  const buildId = typeof BUILD_ID !== 'undefined' ? BUILD_ID : 'DEV';
  const urlObj = new URL(req.url, 'http://localhost');
  const diag = urlObj.searchParams.get('diag') === '1';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  // --- Early returns ---
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', buildId, runtimeHint });
    return;
  }
  if (diag) {
    res.status(200).json({ ok: true, diag: true, buildId, runtimeHint });
    return;
  }

  // --- Node-compatible body parsing with 3s timeout ---
  let body: any = {};
  let bodyType = 'unknown';
  let receivedKeys: string[] = [];
  let bodyWarning = '';
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      body = req.body;
      bodyType = 'object';
    } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      let raw = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
      try {
        body = JSON.parse(raw);
        bodyType = 'object';
      } catch (err) {
        bodyType = 'parse-error';
        bodyWarning = 'Invalid JSON in string/Buffer body';
        body = {};
      }
    } else {
      // Read from stream with 3s timeout
      bodyType = 'stream';
      const raw = await new Promise<string>((resolve, reject) => {
        let data = '';
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          reject(new Error('body timeout'));
        }, 3000);
        req.on('data', (chunk: Buffer|string) => {
          if (timedOut) return;
          data += chunk.toString('utf8');
        });
        req.on('end', () => {
          if (timedOut) return;
          clearTimeout(timer);
          resolve(data);
        });
        req.on('error', (err: any) => {
          if (timedOut) return;
          clearTimeout(timer);
          reject(err);
        });
      });
      try {
        body = JSON.parse(raw);
        bodyType = 'object';
      } catch (err) {
        bodyType = 'parse-error';
        bodyWarning = 'Invalid JSON in stream body';
        body = {};
      }
    }
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      receivedKeys = Object.keys(body);
    } else {
      receivedKeys = [];
    }
  } catch (err: any) {
    body = {};
    bodyType = 'parse-error';
    receivedKeys = [];
    bodyWarning = err?.message || 'parse error';
  }

  // --- Contract enforcement ---
  const { intake, contact, estimate, meta } = body || {};
  let metaObj = meta;
  if (!metaObj || typeof metaObj !== 'object') {
    metaObj = {
      quoteId: `no-quoteid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'unknown',
      userAgent: req.headers && (req.headers['user-agent'] || req.headers['User-Agent']) || undefined,
    };
  }
  if (!intake || !contact || !estimate) {
    res.status(400).json({ ok: false, error: 'intake, contact, and estimate are required', buildId, runtimeHint, bodyType, receivedKeys, bodyWarning });
    return;
  }

  // --- ENV VARS normalization ---
  const officeWebhookUrl = process.env.OFFICE_WEBHOOK_URL || '';
  const scriptUrlValid = officeWebhookUrl.startsWith('https://');
  const resendKey = process.env.RESEND_API_KEY || '';
  const hqEmailsRaw = process.env.HQ_LEADS_EMAILS || '';
  const hqEmails = hqEmailsRaw.split(',').map(e => e.trim()).filter(Boolean);
  const fromAddress = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || '';
  const hasResendKey = !!resendKey;
  const hasOfficeEmails = hqEmails.length > 0;
  const hasScriptUrl = !!officeWebhookUrl;

  // --- Determine actions ---
  const forwardToSheet = scriptUrlValid;
  const emailOffice = hasResendKey && hasOfficeEmails && !!fromAddress;
  const warnings: string[] = [];
  let forwarded = false;
  let emailed = false;

  // --- Forward to Apps Script (Google Sheet) ---
  if (forwardToSheet) {
    try {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 8000);
      const resp = await fetch(officeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, contact, estimate, meta: metaObj }),
        signal: ac.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) {
        warnings.push(`sheet_forward_failed:${resp.status}`);
      } else {
        forwarded = true;
      }
    } catch (err: any) {
      warnings.push('sheet_forward_failed:exception');
    }
  } else {
    warnings.push('sheet_forward_skipped');
  }

  // --- Email HQ ---
  let emailDiag = {
    attempted: false,
    enabled: emailOffice,
    recipientsCount: hqEmails.length,
    ok: false,
    resendStatus: undefined,
    resendErrorCode: undefined,
    error: undefined,
  };
  if (emailOffice && !diag) {
    emailDiag.attempted = true;
    try {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 8000);
      let resendStatus: number | undefined = undefined;
      let resendErrorCode: string | undefined = undefined;
      let errorMsg: string | undefined = undefined;
      // PDF generation and email sending logic here (simulate minimal call)
      try {
        // Simulate PDF generation (omitted)
        // Simulate Resend call
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: hqEmails.map(e => ''), // never expose emails
            subject: 'Estimate',
            text: 'Estimate details',
          }),
          signal: ac.signal,
        });
        clearTimeout(timeout);
        resendStatus = resp.status;
        if (!resp.ok) {
          warnings.push(`resend_failed:${resp.status}`);
          let errText = '';
          try { errText = await resp.text(); } catch {}
          resendErrorCode = errText ? (errText.slice(0, 40) || 'unknown') : 'unknown';
          errorMsg = `Resend failed (${resp.status})`;
        } else {
          emailDiag.ok = true;
          emailed = true;
        }
      } catch (err: any) {
        resendStatus = undefined;
        resendErrorCode = 'exception';
        errorMsg = (err?.message || 'Resend exception').slice(0, 120);
        warnings.push('resend_exception');
      }
      emailDiag.resendStatus = resendStatus;
      emailDiag.resendErrorCode = resendErrorCode;
      emailDiag.error = errorMsg;
      emailDiag.ok = emailed;
    } catch (err: any) {
      emailDiag.error = (err?.message || 'email_failed:exception').slice(0, 120);
      warnings.push('email_failed:exception');
    }
  } else {
    if (!hasResendKey) warnings.push('missing_resend_key');
    if (!hasOfficeEmails) warnings.push('missing_hq_emails');
    if (!fromAddress) warnings.push('missing_resend_from');
    warnings.push('email_skipped');
  }

  // --- Respond ---
  res.status(200).json({
    ok: true,
    forwarded,
    emailed,
    email: emailDiag,
    warnings: warnings.length ? warnings : undefined,
    buildId,
    runtimeHint,
    metaEcho: { quoteId: metaObj.quoteId, source: metaObj.source },
  });
}
