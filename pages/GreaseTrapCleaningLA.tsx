import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const GreaseTrapCleaningLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: "¿Cada cuánto se debe limpiar un grease trap según su tamaño?",
      answer: `<p><strong>La frecuencia depende del volumen y capacidad:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>50-100 gallons:</strong> Cada 2-4 semanas (restaurantes pequeños, food trucks)</li>
        <li><strong>500-750 gallons:</strong> Cada 4-8 semanas (restaurantes medianos)</li>
        <li><strong>1000-1500 gallons:</strong> Cada 8-12 semanas (restaurantes grandes, comerciales)</li>
        <li><strong>2000+ gallons:</strong> Cada 3-6 meses (industrial, múltiples establecimientos)</li>
      </ul>
      <p class="mt-3"><strong>Regla del 25%:</strong> Por regulación del Health Department, debe limpiarse cuando alcanza el 25% de su capacidad con grasa acumulada.</p>`
    },
    {
      question: "¿Qué pasa si no cumplo con las regulaciones del Health Department?",
      answer: `<p>El incumplimiento puede resultar en:</p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Multas de $500 a $10,000+</strong> dependiendo de la gravedad</li>
        <li><strong>Cierre temporal</strong> del establecimiento hasta que se corrija</li>
        <li><strong>Pérdida de licencia</strong> de operación en casos severos</li>
        <li><strong>Responsabilidad por daños</strong> al sistema de alcantarillado municipal (costos pueden ser de $50,000+)</li>
        <li><strong>Demandas civiles</strong> por contaminación o daños a propiedad adyacente</li>
      </ul>
      <p class="mt-3">Además, un grease trap saturado puede causar <strong>backup en tu cocina</strong>, cerrándote operaciones completamente.</p>`
    },
    {
      question: "¿Entregan manifiestos, receipts y documentación de cumplimiento?",
      answer: `<p><strong>Sí, siempre.</strong> Cada servicio incluye:</p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Waste Manifest (Manifiesto):</strong> Documento oficial que certifica la recolección, transporte y disposición del FOG (grasa, aceite, grasas)</li>
        <li><strong>Service Receipt:</strong> Comprobante de pago con fecha, hora, gallones extraídos</li>
        <li><strong>Compliance Certificate:</strong> Certificado de cumplimiento para presentar a inspecciones del Health Department</li>
        <li><strong>Pre/Post Service Photos:</strong> Fotografías del estado antes y después (opcional, bajo solicitud)</li>
        <li><strong>Maintenance Log:</strong> Historial digital de todos tus servicios para auditorías</li>
      </ul>
      <p class="mt-3">Todos los documentos están disponibles <strong>digitalmente 24/7</strong> en tu portal de cliente.</p>`
    },
    {
      question: "¿Atienden emergencias y en cuánto tiempo responden?",
      answer: `<p><strong>Sí, servicio de emergencia 24/7.</strong></p>
      <p><strong>Tiempos de respuesta según área:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Los Angeles (15 millas de Sylmar HQ):</strong> 1-2 horas</li>
        <li><strong>Ventura, San Bernardino, Lancaster:</strong> 2-4 horas</li>
        <li><strong>Orange County, San Diego:</strong> 4-6 horas</li>
      </ul>
      <p class="mt-3"><strong>Situaciones de emergencia incluyen:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Grease trap desbordándose en tu cocina</li>
        <li>Backup en lavaplatos o drains principales</li>
        <li>Inspección sorpresa del Health Department</li>
        <li>Olor severo que afecta operaciones</li>
      </ul>
      <p class="mt-3"><strong>Cargo de emergencia:</strong> +50% sobre tarifa regular (waived si estás en contrato de mantenimiento).</p>`
    },
    {
      question: "¿El servicio incluye bombeo, scraping y disposición completa?",
      answer: `<p><strong>Sí, servicio completo todo-en-uno:</strong></p>
      <ol class="list-decimal ml-6 space-y-2">
        <li><strong>Bombeo (Pumping):</strong> Extracción completa del FOG líquido y sólido usando camiones vacuum de alta potencia</li>
        <li><strong>Scraping:</strong> Raspado manual de paredes internas para remover grasa adherida</li>
        <li><strong>Jet Wash (opcional):</strong> Lavado a presión del interior para limpieza profunda</li>
        <li><strong>Inspection:</strong> Revisión de baffles, inlet/outlet, y detección de daños</li>
        <li><strong>Disposición EPA-Certified:</strong> Transporte y disposición en plantas autorizadas con manifiestos completos</li>
        <li><strong>Site Cleanup:</strong> Limpieza del área de trabajo, sin derrames ni olores</li>
      </ol>
      <p class="mt-3"><strong>No cobramos extra por scraping o disposición</strong> – está incluido en el precio base.</p>`
    },
    {
      question: "¿Cómo calculan el precio de mi grease trap? ¿Tienen calculadora?",
      answer: `<p><strong>Nuestro "Greasy Agent" calcula estimados instantáneos.</strong></p>
      <p><strong>Factores que determinan el precio:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Capacidad del grease trap</strong> (gallons): 50-100 gal = $95-150 | 500-750 gal = $250-400 | 1000-1500 gal = $450-700 | 2000+ gal = $800-1500+</li>
        <li><strong>Distancia desde HQ (Sylmar):</strong> 0-15 mi = $0 | 15-30 mi = +$25 | 30-50 mi = +$50 | 50+ mi = custom quote</li>
        <li><strong>Accesibilidad:</strong> Fácil acceso = $0 | Parking lot trasero = +$25 | Roof access = +$75-150</li>
        <li><strong>Frecuencia:</strong> One-time = precio full | Contrato mensual = -15% | Contrato trimestral = -10%</li>
      </ul>
      <p class="mt-3"><strong>Usa nuestra calculadora</strong> en el chat "Greasy Agent" arriba para un estimado en 60 segundos. Es gratis y sin compromiso.</p>`
    },
    {
      question: "¿Ofrecen contratos de mantenimiento o planes mensuales?",
      answer: `<p><strong>Sí, contratos con descuentos y prioridad garantizada.</strong></p>
      <p><strong>Beneficios de contratos:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>15% descuento</strong> en servicios mensuales</li>
        <li><strong>10% descuento</strong> en servicios trimestrales</li>
        <li><strong>Prioridad 24/7:</strong> Respuesta de emergencia sin cargo extra</li>
        <li><strong>Recordatorios automáticos:</strong> Te notificamos cuando se acerca tu servicio</li>
        <li><strong>Billing consolidado:</strong> Una factura mensual, sin sorpresas</li>
        <li><strong>Compliance tracking:</strong> Portal digital con historial completo para inspecciones</li>
      </ul>
      <p class="mt-3"><strong>Perfecto para:</strong> Restaurantes en fase de growth, multi-location operators, food halls.</p>`
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: "Grease Trap Cleaning Los Angeles",
    description: "Professional grease trap and interceptor pumping services in Los Angeles. Full scraping, pumping, and EPA-certified disposal with manifests. Emergency and scheduled service available 24/7.",
    areaServed: ["Los Angeles", "Ventura", "San Bernardino", "Lancaster", "Palmdale", "Orange County", "San Diego"],
    serviceType: "Grease Trap Cleaning Service",
    url: "https://www.larestaurantservices.com/grease-trap-cleaning-los-angeles"
  });

  const faqSchema = buildFAQPageSchema(faqs);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://www.larestaurantservices.com" },
    { name: "Grease Trap Cleaning Los Angeles", url: "https://www.larestaurantservices.com/grease-trap-cleaning-los-angeles" }
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
            <span className="text-slate-950 font-bold">Grease Trap Cleaning Los Angeles</span>
          </nav>

          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-faucet"></i>
              <span>Professional Grease Trap Service</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Grease Trap Cleaning<br />
              <span className="text-amber-600">Los Angeles</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Professional grease trap and interceptor pumping for restaurants, food trucks, and commercial kitchens across Los Angeles County. Full scraping, high-volume extraction, and EPA-certified disposal with compliance documentation.
            </p>
          </div>

          {/* CTA Bar */}
          <div className="bg-slate-950 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Get Instant Estimate</h3>
              <p className="text-slate-400 text-sm font-medium">Free quote in 60 seconds with our Greasy Agent</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/instant-estimate?service=grease-trap-interceptor" 
                className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-amber-400 transition-all shadow-lg"
              >
                Calculate Price Now
              </Link>
              <a 
                href="tel:8186984252" 
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <Link
                to="/instant-estimate?service=grease-trap-interceptor"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Talk to Dispatch
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                Why Choose Our Grease Trap Services?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-shield-check text-xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">100% Compliance Guaranteed</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Every service includes waste manifests, compliance certificates, and digital documentation for Health Department inspections. Never worry about violations again.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clock text-xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Emergency Response 24/7</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Grease trap overflowing? We respond within 1-2 hours in Los Angeles core areas. Emergency service available nights, weekends, and holidays.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-screwdriver-wrench text-xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Full Service: Pump + Scrape</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Not just pumping – we scrape walls, inspect baffles, and jet wash if needed. Complete cleaning that extends time between services.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Transparent Pricing</h3>
                  <p className="text-slate-600 leading-relaxed">
                    No hidden fees. Get instant estimates with our Greasy Agent calculator. Contracts available with 10-15% discounts for recurring service.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h2 className="text-2xl font-black text-slate-950">Service Areas in Los Angeles</h2>
              <p className="text-slate-600">
                We serve restaurants, food trucks, commercial kitchens, and food halls throughout:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Downtown LA</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Santa Monica</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Pasadena</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Long Beach</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Burbank</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Glendale</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Van Nuys</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>West Hollywood</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-dot text-amber-600 text-sm"></i>
                  <span>Culver City</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h2 className="text-2xl font-black text-slate-950">What's Included in Every Service</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>High-Volume Pumping:</strong> Complete extraction of FOG (fats, oils, grease) using industrial vacuum trucks</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>Manual Scraping:</strong> Removal of hardened grease from walls, baffles, and internal components</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>System Inspection:</strong> Check for cracks, leaks, damaged baffles, and inlet/outlet blockages</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>EPA-Certified Disposal:</strong> Transport to authorized waste facilities with tracking manifests</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>Compliance Documentation:</strong> Service receipt, waste manifest, and compliance certificate for Health Dept</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-slate-700"><strong>Site Cleanup:</strong> Zero mess left behind – drips cleaned, area sanitized</span>
                </li>
              </ul>
            </div>
          </div>

          <ServiceLandingLinks currentPath="/grease-trap-cleaning-los-angeles" />

          {/* FAQ Section */}
          <FAQSection faqs={faqs} />

          {/* Bottom CTA */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-10 rounded-3xl text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Ready to Stay Compliant?
            </h2>
            <p className="text-lg font-medium text-amber-50 max-w-2xl mx-auto">
              Get your free grease trap estimate now. Our Greasy Agent provides instant pricing based on your system size and location.
            </p>
            <Link 
              to="/instant-estimate?service=grease-trap-interceptor" 
              className="inline-block bg-slate-950 text-white px-12 py-5 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-slate-800 transition-all shadow-xl"
            >
              Get Free Estimate
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GreaseTrapCleaningLA;
