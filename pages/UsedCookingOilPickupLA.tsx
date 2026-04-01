import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const UsedCookingOilPickupLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: "¿Cada cuánto deben recoger mi aceite usado de cocina (UCO)?",
      answer: `<p><strong>Depende del volumen de fritura de tu cocina:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Food trucks / Pequeños:</strong> Cada 2-4 semanas (5-15 gallones/mes)</li>
        <li><strong>Restaurantes casual dining:</strong> Cada 1-2 semanas (20-50 gallones/mes)</li>
        <li><strong>Fast food / High-volume fry:</strong> 1-3 veces por semana (100+ gallones/mes)</li>
        <li><strong>Commissaries / Ghost kitchens:</strong> A demanda según producción</li>
      </ul>
      <p class="mt-3"><strong>Regla práctica:</strong> Si tu contenedor de 55 gal se llena cada semana, necesitas pickups 2x/semana o un contenedor más grande (110 gal).</p>`
    },
    {
      question: "¿Me pagan por mi aceite usado? ¿Cuánto?",
      answer: `<p><strong>Sí, te pagamos por UCO de calidad.</strong></p>
      <p><strong>Pricing actual (fluctúa con mercado de biodiesel):</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>UCO limpio (yellow grease):</strong> $0.10-0.25/lb (~$0.80-2.00/gallon)</li>
        <li><strong>UCO con contaminación menor:</strong> $0.05-0.10/lb</li>
        <li><strong>UCO muy sucio (brown grease):</strong> Recolección gratis, sin pago</li>
      </ul>
      <p class="mt-3"><strong>Qué califica como "limpio":</strong> Sin agua, sin comida sólida, filtrado básico, no mezclado con grasa animal cruda.</p>
      <p class="mt-3"><strong>Volumen mínimo para pago:</strong> 50+ gallones/mes. Menores volúmenes: servicio gratis pero sin pago.</p>`
    },
    {
      question: "¿Qué documentación entregan? ¿Es necesaria para inspecciones?",
      answer: `<p><strong>Sí, documentación completa para compliance:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Collection Receipt:</strong> Comprobante con fecha, gallones recolectados, firma de autorización</li>
        <li><strong>Weight Ticket (si aplica pago):</strong> Boleto de peso certificado del processing plant</li>
        <li><strong>Recycling Certificate:</strong> Certificado de que tu UCO fue reciclado en biodiesel o productos autorizados</li>
        <li><strong>Environmental Compliance Report:</strong> Para negocios con certificaciones LEED o green compliance</li>
      </ul>
      <p class="mt-3"><strong>¿Es obligatorio?</strong> En California, algunos condados requieren proof of proper UCO disposal. Los Health Inspectors pueden solicitar documentación durante auditorías.</p>`
    },
    {
      question: "¿Proveen contenedores o debo comprar los míos?",
      answer: `<p><strong>Nosotros proveemos contenedores sin costo.</strong></p>
      <p><strong>Opciones de contenedor:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>55-gallon drum (estándar):</strong> Para la mayoría de restaurantes, gratis en comodato</li>
        <li><strong>110-gallon drum (heavy volume):</strong> Para high-volume fryers, gratis en comodato</li>
        <li><strong>Caddy Bins (5-10 gal):</strong> Contenedores portátiles para trasladar del fryer al drum principal</li>
        <li><strong>Outdoor Storage Cage (opcional):</strong> Jaula con candado para drums en parking lots, +$25/mes rental</li>
      </ul>
      <p class="mt-3"><strong>Importante:</strong> Los contenedores son propiedad de LA Restaurant Services. Si cancelas servicio, debemos recogerlos.</p>`
    },
    {
      question: "¿Qué pasa si alguien roba mi aceite usado? (Oil theft)",
      answer: `<p><strong>El robo de UCO es un problema real en California.</strong></p>
      <p><strong>Por qué roban UCO:</strong> Se vende en mercado negro a $1-2/gallon a procesadores ilegales o para biodiesel casero.</p>
      <p><strong>Cómo prevenirlo:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Contenedores con candado:</strong> Todos nuestros drums incluyen tapa lockable (llave solo tú y nosotros)</li>
        <li><strong>Storage cage:</strong> Jaula metálica con candado para exterior (+$25/mes)</li>
        <li><strong>Interior storage:</strong> Si tienes espacio en tu back-of-house, guarda el drum adentro</li>
        <li><strong>Signage:</strong> Carteles "Monitored by Security" disuaden ladrones casuales</li>
      </ul>
      <p class="mt-3"><strong>¿Qué hacer si roban?</strong> Repórtalo a nosotros y a la policía. Te reemplazamos el drum gratis y ajustamos tu schedule de pickups.</p>`
    },
    {
      question: "¿Puedo mezclar aceite vegetal con grasa animal en el mismo contenedor?",
      answer: `<p><strong>No, deben separarse.</strong></p>
      <p><strong>Por qué:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>UCO vegetal (yellow grease):</strong> Se recicla en biodiesel premium, tiene valor comercial alto</li>
        <li><strong>Grasa animal (tallow, lard):</strong> Requiere processing diferente, menor valor, algunos plants lo rechazan</li>
        <li>Mezclarlos <strong>contamina el batch completo</strong> y reduce o elimina el pago</li>
      </ul>
      <p class="mt-3"><strong>Solución:</strong> Si fríes con ambos tipos, solicita dos contenedores separados (ambos gratis). Uno para aceite vegetal (canola, soybean, etc.) y otro para animal fats.</p>`
    },
    {
      question: "¿Hay un costo de setup o contrato largo plazo?",
      answer: `<p><strong>Zero setup fee. Contratos flexibles.</strong></p>
      <p><strong>Opciones:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Month-to-month:</strong> Sin compromiso, cancela cuando quieras con 2 semanas notice</li>
        <li><strong>1-year contract:</strong> Pricing locked, prioridad en pickups, contenedores adicionales gratis</li>
        <li><strong>Multi-location:</strong> Descuentos por volumen si tienes 3+ locations</li>
      </ul>
      <p class="mt-3"><strong>Incluido siempre:</strong></p>
      <ul class="list-disc ml-6 space-y-2">
        <li>Contenedores en comodato (55 o 110 gal)</li>
        <li>Pickups programados o a-demanda</li>
        <li>Documentación de compliance</li>
        <li>Pago por UCO limpio (si aplica)</li>
      </ul>`
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: "Used Cooking Oil Pickup Los Angeles",
    description: "Professional UCO (used cooking oil) collection and recycling for restaurants in Los Angeles. Free containers, scheduled pickups, payment for clean oil, and compliance documentation included.",
    areaServed: ["Los Angeles", "Ventura", "San Bernardino", "Lancaster", "Palmdale", "Orange County", "San Diego"],
    serviceType: "Used Cooking Oil Recycling Service",
    url: "https://www.larestaurantservices.com/used-cooking-oil-pickup-los-angeles"
  });

  const faqSchema = buildFAQPageSchema(faqs);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://www.larestaurantservices.com" },
    { name: "Used Cooking Oil Pickup", url: "https://www.larestaurantservices.com/used-cooking-oil-pickup-los-angeles" }
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
            <span className="text-slate-950 font-bold">Used Cooking Oil Pickup</span>
          </nav>

          {/* Hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
              <i className="fas fa-recycle"></i>
              <span>Eco-Friendly UCO Recycling</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Used Cooking Oil Pickup<br />
              <span className="text-emerald-600">Los Angeles</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Turn your used cooking oil into cash while staying eco-friendly. Free containers, scheduled pickups, payment for clean oil, and full compliance documentation for restaurants across Los Angeles.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-emerald-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Get Paid For Your Used Oil</h3>
              <p className="text-emerald-100 text-sm font-medium">Free containers • Scheduled pickups • Compliance docs included</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/instant-estimate?service=uco-recycling" 
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-emerald-50 transition-all shadow-lg"
              >
                Request Pickup
              </Link>
              <a 
                href="tel:8186984252" 
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <Link
                to="/instant-estimate?service=uco-recycling"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Talk to Dispatch
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Why Recycle Your Used Cooking Oil?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3 p-6 bg-emerald-50 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900">Get Paid</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Earn $0.10-0.25/lb for clean yellow grease. Turn waste into revenue.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-blue-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <i className="fas fa-leaf text-xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900">Eco-Friendly</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your oil becomes biodiesel, reducing carbon footprint and landfill waste.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-amber-50 rounded-2xl">
                <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center">
                  <i className="fas fa-shield-check text-xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900">Stay Compliant</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Get collection receipts and recycling certificates for Health Dept audits.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h2 className="text-2xl font-black text-slate-950">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-black">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 mb-2">Request Free Container</h4>
                    <p className="text-slate-600">We deliver a 55 or 110-gallon drum to your location at no cost. It's yours to use as long as you're a customer.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-black">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 mb-2">Fill Container with Used Oil</h4>
                    <p className="text-slate-600">After frying, let oil cool and pour it into the drum. Use our caddy bins for easy transport from fryer to drum.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-black">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 mb-2">Schedule or Auto-Pickup</h4>
                    <p className="text-slate-600">We pick up on your regular schedule (weekly, bi-weekly, etc.) or call us when full. No extra charges.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-black">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 mb-2">Get Paid + Documentation</h4>
                    <p className="text-slate-600">Receive payment for clean oil via check or ACH. Get collection receipt and recycling certificate immediately.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h2 className="text-2xl font-black text-slate-950">What Qualifies as "Clean" UCO?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-2xl space-y-3">
                  <h4 className="text-lg font-black text-emerald-900 flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    Yellow Grease (Premium)
                  </h4>
                  <ul className="text-slate-700 text-sm space-y-2">
                    <li>✓ Vegetable oils only (canola, soybean, sunflower, etc.)</li>
                    <li>✓ Filtered or strained (no large food particles)</li>
                    <li>✓ Minimal water content</li>
                    <li>✓ Not rancid or severely oxidized</li>
                    <li className="font-bold text-emerald-700">→ Pays $0.10-0.25/lb</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i>
                    Brown Grease (Low Value)
                  </h4>
                  <ul className="text-slate-700 text-sm space-y-2">
                    <li>⚠ Mixed with animal fats</li>
                    <li>⚠ Heavy food contamination</li>
                    <li>⚠ Water-logged or emulsified</li>
                    <li>⚠ Very dark or rancid</li>
                    <li className="font-bold text-slate-600">→ Free pickup, no payment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <ServiceLandingLinks currentPath="/used-cooking-oil-pickup-los-angeles" />

          {/* FAQ */}
          <FAQSection faqs={faqs} />

          {/* Bottom CTA */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-10 rounded-3xl text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Start Recycling Today
            </h2>
            <p className="text-lg font-medium text-emerald-50 max-w-2xl mx-auto">
              Request your free UCO container and start turning waste into cash while protecting the environment.
            </p>
            <Link 
              to="/instant-estimate?service=uco-recycling" 
              className="inline-block bg-white text-emerald-600 px-12 py-5 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-emerald-50 transition-all shadow-xl"
            >
              Request Free Container
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsedCookingOilPickupLA;
