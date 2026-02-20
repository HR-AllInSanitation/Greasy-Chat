import React from 'react';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';

const RestaurantWasteServicesLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: "¿Qué servicios de waste management ofrecen para restaurantes?",
      answer: `<p><strong>Suite completa de servicios de saneamiento:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Grease Trap Pumping:</strong> Indoor/exterior interceptors, bombeo + scraping completo</li>
        <li><strong>Used Cooking Oil (UCO):</strong> Recolección con pago por oil limpio, contenedores gratis</li>
        <li><strong>Septic/Holding Tank Pumping:</strong> Para restaurantes sin conexión a city sewer</li>
        <li><strong>Main Line Jetting:</strong> Hydro jetting de alta presión para eliminar FOG build-up</li>
        <li><strong>Restroom Trailer Rentals:</strong> Para outdoor dining o renovaciones</li>
        <li><strong>Compliance Audits:</strong> Documentación completa para Health Department</li>
        <li><strong>Hood Cleaning:</strong> Kitchen exhaust cleaning para fire safety</li>
        <li><strong>Janitorial Services:</strong> Deep cleaning de restrooms, dining areas, kitchens</li>
      </ul>`
    },
    {
      question: "¿Ofrecen paquetes all-in-one para nuevos restaurantes?",
      answer: `<p><strong>Sí, "New Opening Package" con 10% descuento.</strong></p>
      <p><strong>El paquete incluye:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Initial Grease Trap Setup:</strong> Inspección, primer servicio, establecimiento de maintenance schedule</li>
        <li><strong>UCO Container Setup:</strong> Delivery de drums, caddy bins, onboarding de staff</li>
        <li><strong>Compliance Consultation:</strong> Revisión de tu setup vs. local Health Dept requirements</li>
        <li><strong>Emergency Support:</strong> Prioridad 24/7 durante tus primeros 90 días</li>
        <li><strong>Predictive Maintenance:</strong> Nuestro Greasy Agent calcula tu optimal service frequency</li>
      </ul>
      <p class="mt-3"><strong>Pricing:</strong> 10% off todos los servicios durante el primer año. Perfecto para multi-location operators abriendo nuevos sites.</p>`
    },
    {
      question: "¿Cuánto cuesta un contrato full-service mensual?",
      answer: `<p><strong>Pricing depende de tu tamaño y volumen:</strong></p>
      <p><strong>Small Restaurant (1-2 locations):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Grease trap (500 gal) 1x/mes: $300</li>
        <li>UCO pickup 2x/mes: Gratis (te pagamos por oil limpio)</li>
        <li>Compliance docs: Incluido</li>
        <li><strong>Total: ~$300/mes</strong></li>
      </ul>
      <p class="mt-3"><strong>Medium Restaurant (high-volume kitchen):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Grease trap (1000 gal) 2x/mes: $550 x 2 = $1,100</li>
        <li>UCO pickup 1x/semana: Gratis (te pagamos por oil limpio)</li>
        <li>Main line jetting (quarterly): $200/3mo = ~$67/mo</li>
        <li><strong>Total: ~$1,167/mes</strong></li>
      </ul>
      <p class="mt-3"><strong>Multi-Location Operator:</strong> Custom packages con volume discounts. Llama para quote personalizado.</p>`
    },
    {
      question: "¿Qué pasa si tengo un backup de grease trap de emergencia?",
      answer: `<p><strong>Respuesta de emergencia 24/7.</strong></p>
      <p><strong>Proceso:</strong></p>
      <ol class="list-decimal ml-6 space-y-2">
        <li>Llama a dispatch: <strong>818-698-4252</strong> (disponible 24/7)</li>
        <li>Describe la emergencia: backup, overflow, olor severo, inspección inminente</li>
        <li>Despachamos truck según urgencia y ubicación:
          <ul class="list-disc ml-6 mt-2">
            <li>Los Angeles core: <strong>1-2 horas</strong></li>
            <li>Ventura/San Bernardino: <strong>2-4 horas</strong></li>
            <li>Orange County/San Diego: <strong>4-6 horas</strong></li>
          </ul>
        </li>
        <li>Servicio completo: pump-out, scraping, inspection, temporary fixes si hay daños</li>
      </ol>
      <p class="mt-3"><strong>Cargo de emergencia:</strong> +50% sobre tarifa regular. <strong>Waived</strong> si estás en contrato mensual de mantenimiento.</p>`
    },
    {
      question: "¿Entregan reportes de cumplimiento (compliance reports) para auditorías?",
      answer: `<p><strong>Sí, documentación completa con cada servicio:</strong></p>
      <p><strong>Incluido siempre:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Service Receipt:</strong> Fecha, hora, gallones extraídos, técnico responsable</li>
        <li><strong>Waste Manifest:</strong> Tracking desde pickup hasta disposal en planta autorizada (EPA-certified)</li>
        <li><strong>Compliance Certificate:</strong> Para presentar a Health Dept inspections</li>
        <li><strong>Photos (opcional):</strong> Pre/post service para evidencia visual</li>
      </ul>
      <p class="mt-3"><strong>Digital Portal 24/7:</strong> Todos tus documentos accesibles online. Perfecto para auditorías o cuando necesitas proof rápido.</p>
      <p class="mt-3"><strong>Multi-location reporting:</strong> Si tienes varios locations, consolidamos todo en un reporte mensual por franquicia/grupo.</p>`
    },
    {
      question: "¿Ayudan con problemas de FOG (fat, oil, grease) en la main line?",
      answer: `<p><strong>Sí, hydro jetting especializado.</strong></p>
      <p><strong>Síntomas de FOG build-up en main line:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Drains lentos en toda la cocina (no solo un lavaplatos)</li>
        <li>Gurgles o bubbling en floor drains</li>
        <li>Backup recurrente incluso después de limpiar grease trap</li>
        <li>Olor a sewage desde pipes</li>
      </ul>
      <p class="mt-3"><strong>Solución: High-Pressure Jetting</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Presión de 3000-4000 PSI</li>
        <li>Elimina FOG acumulado en walls de pipes</li>
        <li>Camera inspection incluida para identificar blockages o daños estructurales</li>
        <li>Pricing: $250-500 dependiendo de footage de line</li>
      </ul>
      <p class="mt-3"><strong>Recomendado:</strong> Jetting preventivo cada 3-6 meses si tienes high-volume fry kitchen.</p>`
    },
    {
      question: "¿Trabajan con franquicias o solo restaurantes independientes?",
      answer: `<p><strong>Ambos. Tenemos experiencia con franquicias y multi-location operators.</strong></p>
      <p><strong>Servicios para franquicias:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Corporate Billing:</strong> Una factura consolidada mensual para todos los locations</li>
        <li><strong>Standardized Service:</strong> Mismo service protocol en todos los sites</li>
        <li><strong>Multi-Location Dashboard:</strong> Portal digital con compliance tracking de toda tu red</li>
        <li><strong>Volume Discounts:</strong> 10-20% off según número de locations</li>
        <li><strong>New Opening Support:</strong> Pre-opening inspections y setup para nuevos sites</li>
      </ul>
      <p class="mt-3"><strong>Franquicias que servimos:</strong> QSR (Burger King, KFC, etc.), casual dining chains, ghost kitchen networks, commissaries.</p>`
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: "Restaurant Waste Services Los Angeles",
    description: "Complete waste management solutions for restaurants in Los Angeles: grease trap pumping, UCO recycling, septic service, line jetting, compliance audits. All-in-one packages available.",
    areaServed: ["Los Angeles", "Ventura", "San Bernardino", "Lancaster", "Palmdale", "Orange County", "San Diego"],
    serviceType: "Restaurant Waste Management Service",
    url: "https://www.larestaurantservices.com/restaurant-waste-services"
  });

  const faqSchema = buildFAQPageSchema(faqs);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://www.larestaurantservices.com" },
    { name: "Restaurant Waste Services", url: "https://www.larestaurantservices.com/restaurant-waste-services" }
  ]);

  return (
    <>
      <StructuredData data={serviceSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />
      
      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <a href="/" className="hover:text-amber-600 transition-colors">Home</a>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Restaurant Waste Services</span>
          </nav>

          {/* Hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/20">
              <i className="fas fa-check-double"></i>
              <span>All-In-One Solution</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Complete Waste Services<br />
              <span className="text-amber-600">for Restaurants</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              From grease traps to used cooking oil, septic tanks to line jetting — we handle all your sanitation and waste compliance needs so you can focus on serving customers.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-slate-950 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">New Opening? Get 10% Off</h3>
              <p className="text-slate-400 text-sm font-medium">First-year discount for new restaurants • All services included</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/#estimator" 
                className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-amber-400 transition-all shadow-lg"
              >
                Get Custom Quote
              </a>
              <a 
                href="tel:8186984252" 
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
            </div>
          </div>

          {/* Services Grid */}
          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              All Services Under One Roof
            </h2>
            
            <div className="grid gap-6">
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-amber-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-faucet text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Grease Trap / Interceptor Service</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      Complete pumping, scraping, and disposal for indoor and exterior grease systems. All sizes from 50-gallon residential traps to 2000+ gallon commercial interceptors.
                    </p>
                    <a href="/grease-trap-cleaning-los-angeles" className="text-amber-600 font-bold text-sm hover:text-amber-700 inline-flex items-center gap-2">
                      Learn More <i className="fas fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-recycle text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Used Cooking Oil (UCO) Recycling</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      Free containers, scheduled pickups, and payment for clean yellow grease. Turn your waste oil into revenue while staying eco-friendly.
                    </p>
                    <a href="/used-cooking-oil-pickup-los-angeles" className="text-emerald-600 font-bold text-sm hover:text-emerald-700 inline-flex items-center gap-2">
                      Learn More <i className="fas fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-water text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Septic & Holding Tank Pumping</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      For restaurants not connected to city sewer. Regular maintenance prevents overflows and keeps you compliant with environmental regulations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 hover:border-purple-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-water-ladder text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Main Sewer Line Jetting (Hydro Jetting)</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      High-pressure water jetting (3000-4000 PSI) clears stubborn FOG build-up in main sewer lines. Camera inspection included to locate blockages.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 hover:border-pink-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-restroom text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Restroom Trailer Rentals</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      Luxury portable restrooms for outdoor dining expansions or facility renovations. Climate controlled, 2-6 stations, flexible rental terms.
                    </p>
                    <a href="/restroom-trailer-rentals-los-angeles" className="text-pink-600 font-bold text-sm hover:text-pink-700 inline-flex items-center gap-2">
                      Learn More <i className="fas fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-file-shield text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Compliance Audits & Documentation</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      Full FOG program documentation, waste manifests, and compliance certificates. Digital portal with 24/7 access to all your service records.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-950">Why Choose LA Restaurant Services?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-emerald-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">One Provider, All Services</h4>
                    <p className="text-slate-600 text-sm">No need to juggle multiple vendors. We handle grease, UCO, septic, jetting, and more.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-emerald-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">24/7 Emergency Response</h4>
                    <p className="text-slate-600 text-sm">Backup or overflow? We respond within 1-2 hours in LA core areas, day or night.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-emerald-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Full Compliance Documentation</h4>
                    <p className="text-slate-600 text-sm">Every service includes manifests, certificates, and receipts for Health Dept audits.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-emerald-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Transparent Pricing</h4>
                    <p className="text-slate-600 text-sm">Instant estimates with our Greasy Agent. No hidden fees, ever.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <FAQSection faqs={faqs} />

          {/* Bottom CTA */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-10 rounded-3xl text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Ready to Simplify Your Operations?
            </h2>
            <p className="text-lg font-medium text-amber-50 max-w-2xl mx-auto">
              Get a custom quote for all your waste and sanitation needs. New openings get 10% off for the first year.
            </p>
            <a 
              href="/#estimator" 
              className="inline-block bg-slate-950 text-white px-12 py-5 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-slate-800 transition-all shadow-xl"
            >
              Get Your Quote
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantWasteServicesLA;
