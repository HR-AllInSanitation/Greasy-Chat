import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const RestroomTrailerRentalsLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: "¿Qué incluye el rental de un restroom trailer?",
      answer: `<p><strong>Todo lo necesario para operación completa:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Delivery & Setup:</strong> Entrega, nivelación, y conexión a utilities (agua, electricidad)</li>
        <li><strong>Full Stocking:</strong> Papel higiénico, toallas, jabón, hand sanitizer premium</li>
        <li><strong>Climate Control:</strong> A/C y calefacción según temporada</li>
        <li><strong>Lighting:</strong> LED interior y exterior para uso nocturno</li>
        <li><strong>Waste Tank:</strong> Tanque de aguas negras con capacidad 100-300 gallones</li>
        <li><strong>Fresh Water Tank:</strong> Agua limpia para lavamanos y flushes</li>
        <li><strong>Pickup & Removal:</strong> Retiro al final del rental period</li>
      </ul>
      <p class="mt-3"><strong>No incluido:</strong> Electricidad consumida (customer provides power outlet), agua si no hay conexión a water line (usamos tank interno).</p>`
    },
    {
      question: "¿Cuánto tiempo puedo rentar un restroom trailer?",
      answer: `<p><strong>Rentals flexibles desde 1 día hasta 12+ meses:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Event Rental (1-7 días):</strong> Bodas, festivales, outdoor dining events. Pricing por día, mínimo 3 días.</li>
        <li><strong>Short-term (1-3 meses):</strong> Renovaciones de baños, expansiones temporales. Pricing mensual.</li>
        <li><strong>Long-term (3-12+ meses):</strong> Construcciones, parklets permanentes, outdoor dining setups. Descuentos por contratos largos.</li>
      </ul>
      <p class="mt-3"><strong>Servicing durante rental:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Event (1-7 días): Sin servicing, retiro al final</li>
        <li>1-3 meses: Servicing semanal (pump-out, restocking, cleaning)</li>
        <li>3+ meses: Servicing 2x/semana o según uso</li>
      </ul>`
    },
    {
      question: "¿Necesito permisos de la ciudad para instalar un restroom trailer?",
      answer: `<p><strong>Depende del tipo de instalación y duración:</strong></p>
      <p><strong>NO requiere permiso (usualmente):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Eventos privados de 1-3 días en propiedad privada</li>
        <li>Construcciones temporales (construction permit covers it)</li>
        <li>Reemplazo temporal mientras reparan baños existentes</li>
      </ul>
      <p class="mt-3"><strong>SÍ requiere permiso:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Outdoor dining permanente en sidewalks o parklets (LA LADOT permit)</li>
        <li>Eventos públicos en calles o parques (special event permit)</li>
        <li>Instalaciones de 6+ meses en zonas comerciales</li>
      </ul>
      <p class="mt-3"><strong>Ayudamos con permisos:</strong> Proveemos specs del trailer (dimensions, weight, utilities) para tu permit application. No hacemos el trámite, pero te damos toda la documentación necesaria.</p>`
    },
    {
      question: "¿Qué capacidad tienen? ¿Cuántas personas pueden usar el trailer?",
      answer: `<p><strong>Capacidades según modelo:</strong></p>
      <p><strong>2-Station Trailer (entry-level):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>2 private stalls (1 men, 1 women o ambos unisex)</li>
        <li>Capacidad: ~50-75 guests para eventos de 4 horas</li>
        <li>Ideal para: Small events, food truck support, renovaciones</li>
      </ul>
      <p class="mt-3"><strong>4-Station Trailer (popular):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>4 private stalls (2 men, 2 women o configuración custom)</li>
        <li>Capacidad: ~100-150 guests para eventos de 4 horas</li>
        <li>Ideal para: Weddings, outdoor dining, medium events</li>
      </ul>
      <p class="mt-3"><strong>6-Station Trailer (high-capacity):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>6 private stalls + urinals</li>
        <li>Capacidad: ~200-300 guests para eventos de 4 horas</li>
        <li>Ideal para: Large festivals, construction sites, commissaries</li>
      </ul>`
    },
    {
      question: "¿Hay cargo de delivery? ¿Qué tan lejos entregan?",
      answer: `<p><strong>Delivery pricing por distancia desde Sylmar HQ:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>0-15 millas:</strong> Delivery + Pickup = $150 total</li>
        <li><strong>15-30 millas:</strong> Delivery + Pickup = $200 total</li>
        <li><strong>30-50 millas:</strong> Delivery + Pickup = $300 total</li>
        <li><strong>50+ millas:</strong> Custom quote (cobramos por milla adicional)</li>
      </ul>
      <p class="mt-3"><strong>Áreas que servimos:</strong> Los Angeles, Ventura, San Bernardino, Orange County, Lancaster/Palmdale, San Diego (con advance notice).</p>
      <p class="mt-3"><strong>Waived delivery fee:</strong> Contratos de 3+ meses incluyen delivery y pickup gratis.</p>`
    },
    {
      question: "¿Qué pasa si el trailer se llena antes de tiempo o hay un problema?",
      answer: `<p><strong>Emergency service disponible 24/7:</strong></p>
      <p><strong>Si el waste tank se llena:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Llama a dispatch: 818-698-4252</li>
        <li>Enviamos truck para pump-out emergency (2-4 horas response time)</li>
        <li>Cargo: $150 emergency pump-out (waived si estás en contrato mensual)</li>
      </ul>
      <p class="mt-3"><strong>Si hay malfunction (toilet, sink, A/C):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Llama a dispatch para troubleshooting</li>
        <li>Enviamos técnico o trailer de reemplazo si es necesario</li>
        <li>No hay cargo por malfunctions (cubierto por rental)</li>
      </ul>
      <p class="mt-3"><strong>Preventivo:</strong> En long-term rentals, hacemos inspección completa cada mes para evitar issues.</p>`
    },
    {
      question: "¿Los trailers son luxury o básicos? ¿Qué tan limpios están?",
      answer: `<p><strong>Todos nuestros trailers son "luxury-grade":</strong></p>
      <p><strong>Features estándar:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Pisos de madera o vinyl de alta calidad (no plastic barato)</li>
        <li>Flushable porcelain toilets (como baños residenciales, no porta-potties)</li>
        <li>Lavamanos con running water y jabón premium</li>
        <li>Mirrors, shelves, hooks para bags/jackets</li>
        <li>Climate control (A/C + calefacción)</li>
        <li>LED lighting interior y exterior</li>
        <li>Music system (bluetooth speaker opcional)</li>
      </ul>
      <p class="mt-3"><strong>Limpieza:</strong> Cada trailer es deep-cleaned y sanitized antes de cada rental. Pre-delivery photos disponibles bajo solicitud.</p>`
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: "Restroom Trailer Rentals Los Angeles",
    description: "Premium portable restroom trailer rentals for restaurants, events, construction, and outdoor dining in Los Angeles. Climate controlled, luxury amenities, flexible rental terms from 1 day to 12+ months.",
    areaServed: ["Los Angeles", "Ventura", "San Bernardino", "Lancaster", "Palmdale", "Orange County", "San Diego"],
    serviceType: "Portable Restroom Rental Service",
    url: "https://www.larestaurantservices.com/restroom-trailer-rentals-los-angeles"
  });

  const faqSchema = buildFAQPageSchema(faqs);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://www.larestaurantservices.com" },
    { name: "Restroom Trailer Rentals", url: "https://www.larestaurantservices.com/restroom-trailer-rentals-los-angeles" }
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
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Restroom Trailer Rentals</span>
          </nav>

          {/* Hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-purple-100">
              <i className="fas fa-restroom"></i>
              <span>Luxury Portable Restrooms</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Restroom Trailer Rentals<br />
              <span className="text-purple-600">Los Angeles</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Premium portable restroom trailers for outdoor dining, events, construction, and facility renovations. Climate controlled, luxury amenities, and flexible rental terms from 1 day to 12+ months.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-purple-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Reserve Your Trailer Today</h3>
              <p className="text-purple-100 text-sm font-medium">2-6 station trailers • Climate controlled • Full service included</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/instant-estimate?service=restroom-rentals" 
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-purple-50 transition-all shadow-lg"
              >
                Get Quote
              </Link>
              <a 
                href="tel:8186984252" 
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <Link
                to="/instant-estimate?service=restroom-rentals"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Complex Case Review
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Perfect for Any Situation
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <i className="fas fa-utensils text-3xl text-purple-600"></i>
                <h3 className="text-xl font-black text-slate-900">Outdoor Dining</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Expand your restaurant to sidewalk or parklet dining without worrying about restroom access. ADA-compliant options available.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <i className="fas fa-ring text-3xl text-blue-600"></i>
                <h3 className="text-xl font-black text-slate-900">Special Events</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Weddings, festivals, corporate events. Luxury amenities that impress your guests, not embarrass them.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <i className="fas fa-hard-hat text-3xl text-amber-600"></i>
                <h3 className="text-xl font-black text-slate-900">Construction Sites</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Multi-station trailers for crews. More sanitary and professional than porta-potties. OSHA compliant.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <i className="fas fa-wrench text-3xl text-emerald-600"></i>
                <h3 className="text-xl font-black text-slate-900">Facility Renovations</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Keep operating during restroom remodels. No need to close your business while contractors work.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-950">Trailer Models & Pricing</h2>
              
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h4 className="text-lg font-black text-slate-900">2-Station Compact Trailer</h4>
                    <p className="text-sm text-slate-600 mt-1">Perfect for small events or food truck support</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Capacity:</span>
                      <span className="text-slate-900 font-bold">50-75 guests (4hr event)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Daily Rate (3-day min):</span>
                      <span className="text-amber-600 font-black text-lg">$350/day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Monthly Rate:</span>
                      <span className="text-amber-600 font-black text-lg">$1,800/mo</span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-purple-300 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-slate-900">4-Station Standard Trailer</h4>
                      <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Popular</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">Most popular for weddings and outdoor dining</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Capacity:</span>
                      <span className="text-slate-900 font-bold">100-150 guests (4hr event)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Daily Rate (3-day min):</span>
                      <span className="text-purple-600 font-black text-lg">$550/day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Monthly Rate:</span>
                      <span className="text-purple-600 font-black text-lg">$2,800/mo</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h4 className="text-lg font-black text-slate-900">6-Station Executive Trailer</h4>
                    <p className="text-sm text-slate-600 mt-1">High-capacity for large events and construction</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Capacity:</span>
                      <span className="text-slate-900 font-bold">200-300 guests (4hr event)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Daily Rate (3-day min):</span>
                      <span className="text-amber-600 font-black text-lg">$850/day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Monthly Rate:</span>
                      <span className="text-amber-600 font-black text-lg">$4,200/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h4 className="text-lg font-black text-amber-900 mb-3">Additional Fees & Services</h4>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-truck text-amber-600"></i>
                    <span><strong>Delivery & Pickup:</strong> $150-300 depending on distance (waived for 3+ month contracts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-pump-soap text-amber-600"></i>
                    <span><strong>Weekly Servicing:</strong> Included in monthly rates (pump-out, restocking, cleaning)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-fire text-amber-600"></i>
                    <span><strong>Emergency Pump-Out:</strong> $150 (waived for monthly customers)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-wheelchair text-amber-600"></i>
                    <span><strong>ADA-Compliant Unit:</strong> +$150/day or +$600/mo upgrade</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <ServiceLandingLinks currentPath="/restroom-trailer-rentals-los-angeles" />

          {/* FAQ */}
          <FAQSection faqs={faqs} />

          {/* Bottom CTA */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-10 rounded-3xl text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Reserve Your Trailer Now
            </h2>
            <p className="text-lg font-medium text-purple-50 max-w-2xl mx-auto">
              Limited availability during peak event season. Get your quote today and secure your rental dates.
            </p>
            <Link 
              to="/instant-estimate?service=restroom-rentals" 
              className="inline-block bg-white text-purple-600 px-12 py-5 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-purple-50 transition-all shadow-xl"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestroomTrailerRentalsLA;
