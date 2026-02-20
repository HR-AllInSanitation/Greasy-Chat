export interface FAQ {
  category: string;
  question: string;
  answer: string;
  ctaMessage?: string;
}

export const faqs: FAQ[] = [
  // Grease Trap Questions
  {
    category: "Grease Trap",
    question: "How often should I clean my grease trap?",
    ctaMessage: "I need help setting up a grease trap cleaning schedule for my restaurant.",
    answer: `
      <p>The frequency depends on your kitchen size and volume. <strong>LA County Health Department</strong> requires cleaning when the grease trap reaches <strong>25% of its capacity</strong> with FOG (fats, oils, grease).</p>
      <p><strong>Recommended frequencies:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>50-100 gallons:</strong> Every 2-4 weeks (food trucks, small restaurants)</li>
        <li><strong>500-750 gallons:</strong> Every 4-8 weeks (casual dining)</li>
        <li><strong>1000-1500 gallons:</strong> Every 8-12 weeks (high-volume restaurants)</li>
        <li><strong>2000+ gallons:</strong> Every 3-6 months (industrial, multi-location)</li>
      </ul>
      <p class="mt-3"><strong>Best practice:</strong> Inspect weekly with a stick to measure the grease layer. If it exceeds 2-3 inches, schedule immediate cleaning.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>📞 Need a cleaning schedule?</strong> We offer customized maintenance plans based on your volume. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Get a free estimate</a> and we'll recommend the optimal frequency for your operation.</p>
    `
  },
  {
    category: "Grease Trap",
    question: "What happens if I don't comply with Health Department regulations?",
    ctaMessage: "I need help ensuring my restaurant is 100% compliant with LA County FOG regulations.",
    answer: `
      <p>Non-compliance with LA County's <strong>FOG Control Program</strong> can result in severe consequences:</p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Fines:</strong> $500 to $10,000+ depending on violation severity</li>
        <li><strong>Temporary closure:</strong> Until you correct the violation and pass re-inspection</li>
        <li><strong>Civil liability:</strong> If your grease causes municipal sewer backup (costs can exceed $50,000)</li>
        <li><strong>License revocation:</strong> In cases of repeated violations or gross negligence</li>
      </ul>
      <p class="mt-3"><strong>Relevant regulation:</strong> California Plumbing Code Section 1014.1 requires grease interceptors in all food service establishments.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>🛡️ Stay compliant, avoid fines.</strong> Our service includes all required documentation, waste manifests, and compliance certificates. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Contact us</a> to ensure you're 100% compliant.</p>
    `
  },
  {
    category: "Grease Trap",
    question: "What documentation must I maintain for inspections?",
    ctaMessage: "I want to ensure I have all the required documentation for Health Department inspections.",
    answer: `
      <p>To pass <strong>LA County Health Department</strong> inspections, you must maintain:</p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Waste Manifests:</strong> Proof of each pump-out with date, gallons extracted, and disposal facility</li>
        <li><strong>Service Receipts:</strong> Minimum of the last 12 months</li>
        <li><strong>Compliance Certificates:</strong> If your jurisdiction requires them (some cities within LA County)</li>
        <li><strong>Inspection Logs:</strong> Self-inspection records if you're in the FOG program</li>
        <li><strong>Grease Trap Sizing Documentation:</strong> Proof that your trap is adequate for your volume</li>
      </ul>
      <p class="mt-3"><strong>Best practice:</strong> Keep digital copies in the cloud. Inspectors can request them without prior notice, and having immediate access demonstrates professionalism.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>📋 Documentation made easy.</strong> With every service, we provide complete manifests, receipts, and certificates automatically. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Start service today</a> and never worry about inspection paperwork again.</p>
    `
  },

  // Used Cooking Oil Questions
  {
    category: "Used Cooking Oil",
    question: "Is it mandatory to recycle used cooking oil in California?",
    ctaMessage: "I'd like to schedule used cooking oil pickup and start earning money from our oil.",
    answer: `
      <p>While California doesn't have a law that <em>requires</em> UCO (used cooking oil) recycling, there are strong incentives and regulations:</p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Banned from regular trash:</strong> UCO cannot go to landfills (California Code of Regulations Title 14)</li>
        <li><strong>Banned from drains:</strong> Pouring oil down the drain violates FOG regulations and can result in fines</li>
        <li><strong>Illegal disposal:</strong> Can result in fines of $1,000 to $25,000 per violation</li>
      </ul>
      <p class="mt-3"><strong>Solution:</strong> UCO recycling is the only legal and viable option. Plus, many services pay you for clean oil, turning waste into revenue.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>💰 Turn waste into revenue.</strong> We pay competitive rates for clean UCO and provide free collection containers. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Schedule your pickup</a> and start earning today.</p>
    `
  },
  {
    category: "Used Cooking Oil",
    question: "How do I prevent used cooking oil theft? (UCO theft)",
    ctaMessage: "I need lockable containers and secure storage solutions to prevent UCO theft.",
    answer: `
      <p>UCO theft is a real problem in Southern California due to the oil's value for biodiesel:</p>
      <p><strong>Prevention measures:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Lockable containers:</strong> Use drums with lockable lids (only you and your provider have keys)</li>
        <li><strong>Interior storage:</strong> If you have space in your back-of-house, store the drum inside</li>
        <li><strong>Storage cage:</strong> Metal cage with padlock for exterior (available with our service)</li>
        <li><strong>Lighting:</strong> Ensure the storage area is well-lit and visible</li>
        <li><strong>Cameras:</strong> Even dummy cameras can deter casual thieves</li>
        <li><strong>Signage:</strong> Signs saying "Monitored Area" or "Property of [Company]"</li>
      </ul>
      <p class="mt-3"><strong>If theft occurs:</strong> Report it to police and your provider. This helps track patterns and prevent future incidents in your area.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>🔒 Protect your oil.</strong> We provide lockable containers and secure storage solutions at no extra cost. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Contact us</a> to upgrade to theft-resistant equipment.</p>
    `
  },

  // Compliance & Regulations
  {
    category: "Compliance",
    question: "What is LA County's FOG Control Program?",
    ctaMessage: "I need help understanding and complying with the FOG Control Program requirements.",
    answer: `
      <p>The <strong>Fats, Oils, and Grease (FOG) Control Program</strong> is a mandatory program by LA County Sanitation Districts designed to prevent sewer overflows and protect the municipal sewage system.</p>
      <p><strong>Main requirements:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li>Installation of grease interceptors in all food service establishments</li>
        <li>Regular maintenance according to the 25% capacity rule</li>
        <li>Complete documentation of all cleaning services</li>
        <li>Best Management Practices (BMPs) like sink screens, no pouring grease down drains</li>
        <li>Allow unannounced inspections by authorities</li>
      </ul>
      <p class="mt-3"><strong>More information:</strong> <a href="https://www.lacsd.org/services/wastewater/fog-program" target="_blank" class="text-amber-600 hover:text-amber-700">lacsd.org/fog-program</a></p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>✅ FOG Program compliance experts.</strong> We know every requirement and ensure you meet all LA County standards. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Get a compliance audit</a> and peace of mind.</p>
    `
  },
  {
    category: "Compliance",
    question: "Do I need special permits for outdoor dining with restroom trailers?",
    ctaMessage: "I need an ADA-compliant restroom trailer for our outdoor dining area.",
    answer: `
      <p>For <strong>permanent outdoor dining</strong> in Los Angeles, you need specific permits:</p>
      <p><strong>LADOT Al Fresco Permit (if using sidewalk/parklet):</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li>Application through LA Department of Transportation</li>
        <li>Must include restroom facilities plan (trailer or access to indoor restrooms)</li>
        <li>ADA compliance required (minimum 1 ADA-accessible restroom)</li>
        <li>Health Department inspection before approval</li>
      </ul>
      <p class="mt-3"><strong>Temporary events (1-3 days):</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li>Special Event Permit (if on public street/park)</li>
        <li>Generally no permit required if on your private property</li>
      </ul>
      <p class="mt-3"><strong>Tip:</strong> Consult with your trailer provider to get the specs (dimensions, weight, utilities) needed for your permit application.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>🚻 Restroom trailer rentals.</strong> We offer ADA-compliant trailers for outdoor dining and special events, with all permit documentation included. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Request a quote</a> for your event.</p>
    `
  },

  // Best Practices
  {
    category: "Best Practices",
    question: "How can I extend the time between grease trap cleanings?",
    ctaMessage: "I'd like a free BMP consultation to reduce our grease trap maintenance costs.",
    answer: `
      <p>Implementing <strong>Best Management Practices (BMPs)</strong> can reduce cleaning frequency:</p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Basket strainers:</strong> In all sinks to capture food solids before they reach the trap</li>
        <li><strong>Pre-scraping:</strong> Scrape plates into trash before washing</li>
        <li><strong>No hot water in grease drains:</strong> Hot water melts grease but it re-solidifies in pipes</li>
        <li><strong>Enzyme bacteria treatments:</strong> Biological products that break down grease (regular use)</li>
        <li><strong>Employee training:</strong> Train staff on what NOT to pour down the drain</li>
        <li><strong>Grease disposal container:</strong> Separate container for scraping grease from cooking surfaces</li>
      </ul>
      <p class="mt-3"><strong>Important:</strong> These practices extend time between cleanings but do NOT eliminate the need for regular pump-outs. The 25% rule still applies.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>💡 Free BMP consultation.</strong> We'll assess your operation and recommend specific practices to reduce costs. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Schedule a visit</a> and start saving today.</p>
    `
  },
  {
    category: "Best Practices",
    question: "When do I need hydro jetting vs. just grease trap cleaning?",
    ctaMessage: "I need a camera inspection to diagnose our drain issues and find the right solution.",
    answer: `
      <p><strong>Hydro jetting</strong> is needed when the problem is in your <em>main sewer lines</em>, not just the grease trap:</p>
      <p><strong>Signs you need jetting:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li>Slow drains in <strong>multiple</strong> fixtures (not just one)</li>
        <li>Recurring backup even after cleaning grease trap</li>
        <li>Gurgles or bubbling in floor drains</li>
        <li>Sewage odor from pipes, not from grease trap</li>
        <li>Grease trap fills faster than normal (indicates downstream blockage)</li>
      </ul>
      <p class="mt-3"><strong>Prevention:</strong> For high-volume fry kitchens, consider preventive hydro jetting every 6-12 months to avoid severe FOG buildup in main lines.</p>
      <p class="mt-3"><strong>Process:</strong> Jetting uses water at 3000-4000 PSI to remove grease adhered to pipe walls. Includes camera inspection to identify blockages or structural damage.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>🔧 Jetting + Camera Inspection.</strong> Not sure what you need? We offer diagnostic camera inspections to identify the exact problem. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Book an inspection</a> and get the right solution.</p>
    `
  },
  {
    category: "Best Practices",
    question: "How do I choose the right grease trap size for my restaurant?",
    ctaMessage: "I'd like a free consultation to determine if our grease trap is correctly sized.",
    answer: `
      <p><strong>Correct sizing</strong> is critical for compliance and operational efficiency:</p>
      <p><strong>California Plumbing Code requires:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li>Minimum 500 gallon capacity for most restaurants</li>
        <li>Sizing based on: connected fixtures, kitchen type (grease load), and peak flow rate</li>
      </ul>
      <p class="mt-3"><strong>General rules:</strong></p>
      <ul class="list-disc ml-6 space-y-1">
        <li><strong>Food truck / Small café:</strong> 50-100 gallons</li>
        <li><strong>Fast casual / Café with kitchen:</strong> 500-750 gallons</li>
        <li><strong>Full-service restaurant:</strong> 1000-1500 gallons</li>
        <li><strong>High-volume / Multi-location:</strong> 2000+ gallons or multiple traps</li>
      </ul>
      <p class="mt-3"><strong>Undersized trap = problems:</strong> More frequent cleanings, overflows, fines. <strong>Oversized trap = waste:</strong> Unnecessary cost, harder to maintain.</p>
      <p class="mt-3"><strong>Tip:</strong> A licensed plumber or health inspector can make the correct calculation based on your fixtures and menu.</p>
      <p class="mt-4 p-3 bg-amber-50 border-l-4 border-amber-600 rounded"><strong>📐 Free sizing consultation.</strong> Unsure if your trap is correctly sized? We'll evaluate your setup and recommend the right solution. <a href="#estimator" class="text-amber-600 hover:text-amber-700 font-semibold">Get expert advice</a> at no cost.</p>
    `
  }
];
