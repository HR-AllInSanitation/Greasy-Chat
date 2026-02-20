# URLs de Testing - Páginas SEO

## Testing Local (Development)

Una vez iniciado el servidor con `npm run dev`, puedes probar las siguientes URLs:

### Homepage (Original)
```
http://localhost:3000/
```

### Páginas de Servicio Dedicadas

1. **Grease Trap Cleaning**
   ```
   http://localhost:3000/grease-trap-cleaning-los-angeles
   ```
   - Verificar: FAQ accordion, Schema JSON-LD visible en source, breadcrumbs, CTAs

2. **Used Cooking Oil Pickup**
   ```
   http://localhost:3000/used-cooking-oil-pickup-los-angeles
   ```
   - Verificar: Pricing info, "Get Paid" messaging, container info

3. **Restroom Trailer Rentals**
   ```
   http://localhost:3000/restroom-trailer-rentals-los-angeles
   ```
   - Verificar: Pricing table (2/4/6 station), capacity info, permits FAQ

4. **Restaurant Waste Services (Hub)**
   ```
   http://localhost:3000/restaurant-waste-services
   ```
   - Verificar: Cross-links a otras páginas, paquetes all-in-one

---

## Validation Tools

### Schema.org Validator
1. Ejecuta `npm run build`
2. Inspecciona `dist/index.html` y copia el Schema JSON-LD
3. Pega en: https://validator.schema.org/
4. Verifica que no haya errores

### Google Rich Results Test
1. Deploy el sitio a producción
2. Visita: https://search.google.com/test/rich-results
3. Ingresa cada URL
4. Verifica que detecte: Service, FAQPage, BreadcrumbList

### ChatGPT/Claude Test
1. Pregunta: "¿Cuánto cuesta limpiar un grease trap de 500 gallones en Los Angeles?"
2. Observa si menciona LA Restaurant Services
3. Verifica que cite datos específicos del FAQ

---

## Checklist de QA

### Funcionalidad
- [ ] Todas las rutas cargan sin 404
- [ ] FAQs se expanden/colapsan al hacer click
- [ ] Breadcrumbs son clicables y funcionales
- [ ] CTAs llevan a `/#estimator` correctamente
- [ ] Links de teléfono `tel:8186984252` funcionan en móvil

### Schema Validation
- [ ] LocalBusiness en homepage válido
- [ ] Service schema en cada página
- [ ] FAQPage schema con todas las preguntas
- [ ] BreadcrumbList con jerarquía correcta

### SEO Meta Tags
- [ ] Cada página tiene `<title>` único (si implementas React Helmet)
- [ ] Meta description relevante por página
- [ ] Canonical URL correcto

### Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] Build size < 300 KB
- [ ] No errores de consola en ninguna página

### Mobile
- [ ] Responsive en 375px (iPhone SE)
- [ ] Responsive en 768px (iPad)
- [ ] Touch targets > 44px
- [ ] No horizontal scroll

---

## Production URLs (Después de Deploy)

```
https://www.larestaurantservices.com/
https://www.larestaurantservices.com/grease-trap-cleaning-los-angeles
https://www.larestaurantservices.com/used-cooking-oil-pickup-los-angeles
https://www.larestaurantservices.com/restroom-trailer-rentals-los-angeles
https://www.larestaurantservices.com/restaurant-waste-services
```

### Post-Deploy Tasks
1. Submit sitemap.xml a Google Search Console
2. Request indexing de cada URL nueva
3. Monitor Google Search Console para errores de Schema
4. Test conversacional con ChatGPT/Perplexity después de ~1 semana

---

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Primary |
| Safari | Latest | ✅ iOS testing |
| Firefox | Latest | ⚠️ Optional |
| Edge | Latest | ⚠️ Optional |

---

## Debugging Tips

### Si las rutas no funcionan en producción:
- Asegúrate que el servidor tenga fallback a `index.html` (SPA routing)
- Netlify: Ya configurado automáticamente
- Vercel: Ya configurado automáticamente
- Apache: Necesitas `.htaccess` con rewrite rules

### Si el Schema no aparece en Google:
- Dale 1-2 semanas para que Google re-crawlee
- Usa "Request Indexing" en Search Console
- Verifica que el JSON-LD no tenga errores de sintaxis

### Si los FAQs no se expanden:
- Abre DevTools Console
- Busca errores de JavaScript
- Verifica que `FAQSection.tsx` esté importado correctamente
