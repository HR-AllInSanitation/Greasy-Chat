import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

  const amount = typeof estimate?.amount === 'number' ? `$${estimate.amount.toFixed(2)}` : String(estimate?.amount ?? '');
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

  const amount = typeof estimate?.amount === 'number' ? `$${estimate.amount.toFixed(2)}` : String(estimate?.amount ?? '');
  const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
  const address = addressParts.join(', ');
  const isReady = intake?.wants_to_move_forward === true;
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
    const amount = typeof estimate?.amount === 'number' ? `$${estimate.amount.toFixed(2)}` : String(estimate?.amount ?? 'N/A');
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
export default async function handler(req: Request): Promise<Response> {
  const json = (status: number, data: any) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  if (req.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // If parsing fails, keep body as {} to preserve prior behavior
      body = {};
    }

    const { intake, contact, estimate, source, createdAt } = body || {};

    if (!intake || !contact || !estimate) {
      return json(400, { ok: false, error: 'intake, contact, and estimate are required' });
    }

    // Log the received payload for observability/debugging
    console.log('Received estimate payload', { intake, contact, estimate, source, createdAt });

    const webhookUrl = process.env.OFFICE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('OFFICE_WEBHOOK_URL is not set; skipping webhook forward');
      return json(200, { ok: true, forwarded: false });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, contact, estimate, source, createdAt }),
      });

      if (!response.ok) {
        console.error('Webhook responded with non-OK status', response.status, await response.text());
        return json(200, { ok: false, error: 'Webhook call failed' });
      }
    } catch (err: any) {
      console.error('Webhook call errored', err?.message || err);
      return json(200, { ok: false, error: 'Webhook call errored' });
    }

    // Fire-and-forget PDF + email; do not affect response
    void (async () => {
      const pdfBytes = await generateEstimatePdf({ intake, contact, estimate, source, createdAt });
      await sendCustomerEmail({ intake, contact, estimate, pdfBytes });
      await sendHqEmail({ intake, contact, estimate, pdfBytes });
    })();

    return json(200, { ok: true, forwarded: true });
  } catch (err: any) {
    console.error('Unexpected error in /api/estimate', err?.message || err);
    return json(500, { ok: false, error: 'Internal error' });
  }
}
