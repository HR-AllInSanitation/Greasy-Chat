# 📋 NUEVO ENFOQUE: FAQs Integradas en Homepage

## 🎯 Objetivo Revisado

En lugar de páginas separadas, agregar **FAQs colapsables bajo cada servicio** en la homepage existente, con información que:
- Oriente a clientes potenciales
- Contenga regulaciones locales (Health Dept, FOG compliance)
- Incluya best practices
- Sea útil para que AI (ChatGPT, Claude, Perplexity) recomiende nuestro servicio

---

## 📐 Estructura Propuesta

### Mantener:
- ✅ Homepage actual (`App.tsx`)
- ✅ Greasy Agent (chat estimator)
- ✅ Core Services grid (8 servicios)

### Agregar:
- ✅ Sección de FAQ colapsable DEBAJO de "Core Services"
- ✅ Schema.org FAQPage en `index.html`
- ✅ Información general, regulaciones, best practices por servicio

---

## 🗂️ Estructura de FAQs Propuesta

### 1. Grease Trap / Interceptor Pumping
**Preguntas clave**:
- ¿Cada cuánto debo limpiar mi grease trap? (Regulación: 25% capacity rule)
- ¿Qué dice el LA County Health Department sobre grease traps?
- ¿Qué pasa si no cumplo con FOG regulations? (Multas, cierre)
- ¿Qué es la "25% rule" y cómo la aplico?
- Best practice: ¿Cómo extender el tiempo entre limpiezas?

### 2. Used Cooking Oil (UCO) Recycling
**Preguntas clave**:
- ¿Es obligatorio reciclar mi aceite usado en California?
- ¿Cómo prevenir robos de UCO? (Problema común en SoCal)
- Best practice: ¿Cómo separar aceite vegetal de grasa animal?
- ¿Qué documentación debo mantener para auditorías?

### 3. Septic / Holding Tank Pumping
**Preguntas clave**:
- ¿Cuándo necesito septic pumping vs. grease trap service?
- Regulaciones de California para septic tanks en restaurantes
- Best practice: Señales de que mi septic está por saturarse

### 4. Main Sewer Line Jetting (Hydro Jetting)
**Preguntas clave**:
- ¿Cuándo necesito jetting vs. solo grease trap cleaning?
- ¿Qué es FOG buildup en main lines?
- Best practice: Frecuencia preventiva para high-volume kitchens

### 5. UCO Recycling (Duplicate - merge with #2)

### 6. Restroom Rentals
**Preguntas clave**:
- ¿Necesito permisos para restroom trailers en outdoor dining?
- LADOT regulations para parklets/sidewalk dining
- Best practice: Sizing para número de guests

### 7. Compliance Audit
**Preguntas clave**:
- ¿Qué documentos debo tener listos para Health inspections?
- FOG Control Program requirements en LA County
- Best practice: Cómo mantener compliance year-round

### 8. Hood Cleaning
**Preguntas clave**:
- ¿Cada cuánto es obligatorio hood cleaning? (Fire code)
- NFPA 96 standards para kitchen exhaust systems
- Best practice: Señales de que necesito cleaning inmediato

### 9. Janitorial Services
**Preguntas clave**:
- Health code requirements para restroom sanitation
- Best practice: Daily vs. weekly janitorial schedules

---

## 🎨 Diseño UX Propuesto

### Opción A: FAQ Section Global (Recomendada)
```
[Hero]
[Services Grid - 8 cards]
[FAQ Section - Categorizada por Servicio]
  ├─ "Grease Trap Questions" (4-5 FAQs)
  ├─ "Used Cooking Oil Questions" (3-4 FAQs)
  ├─ "Compliance & Regulations" (4-5 FAQs)
  ├─ "Best Practices" (3-4 FAQs)
[Footer]
```

### Opción B: FAQs Inline por Servicio
```
[Hero]
[Service 1: Grease Trap]
  └─ [Mini FAQ - 3 preguntas colapsables]
[Service 2: UCO]
  └─ [Mini FAQ - 3 preguntas colapsables]
...
[Footer]
```

**Recomendación**: Opción A es mejor para SEO/AI porque:
- Más fácil de indexar como FAQPage completa
- Schema.org más limpio
- Usuarios pueden escanear todas las FAQs en un lugar

---

## 🤖 Optimización para AI (Sin Páginas Separadas)

### Schema.org en Homepage:
```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "FAQPage"],
  "name": "LA Restaurant Services",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cada cuánto debo limpiar mi grease trap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Según LA County Health Dept, la regla 25%..."
      }
    },
    // ... más preguntas
  ]
}
```

### Contenido Optimizado:
- **Regulaciones explícitas**: "LA County Health Department requiere..."
- **Datos específicos**: "Multas de $500-$10,000", "1-2 horas response time"
- **Keywords naturales**: "grease trap Los Angeles", "FOG compliance California"
- **Citations**: "NFPA 96 standards", "California Plumbing Code Section 1014"

---

## 📝 Contenido Ejemplo (Grease Trap FAQs)

### FAQ 1: ¿Cada cuánto debo limpiar mi grease trap?
**Respuesta**:
> La frecuencia depende del tamaño y volumen de tu cocina. **LA County Health Department** requiere limpieza cuando el grease trap alcanza el **25% de su capacidad** con FOG (fats, oils, grease). En la práctica:
> - **50-100 gallons**: Cada 2-4 semanas (food trucks, pequeños restaurantes)
> - **500-750 gallons**: Cada 4-8 semanas (casual dining)
> - **1000+ gallons**: Cada 8-12 semanas (high-volume restaurants)
>
> **Best practice**: Inspecciona semanalmente con un stick para medir la capa de grasa. Si supera 2-3 pulgadas, programa limpieza.

### FAQ 2: ¿Qué pasa si no cumplo con FOG regulations?
**Respuesta**:
> El incumplimiento del **FOG Control Program** de LA County puede resultar en:
> - **Multas**: $500-$10,000+ según gravedad
> - **Cierre temporal**: Hasta que corrijas la violación
> - **Responsabilidad civil**: Si tu grease causa backup en sewer municipal (costos de $50,000+)
> - **Pérdida de licencia**: En casos de violaciones repetidas
>
> **Regulación relevante**: California Plumbing Code Section 1014.1 - Grease Interceptors Required.

### FAQ 3: ¿Qué documentación debo mantener?
**Respuesta**:
> Para pasar inspecciones del Health Department, debes tener:
> - **Waste Manifests**: Proof de cada pump-out con fecha, gallones, disposal facility
> - **Service Receipts**: De los últimos 12 meses mínimo
> - **Compliance Certificates**: Si tu jurisdicción los requiere
> - **Inspection Logs**: Self-inspection records si estás en FOG program
>
> **Best practice**: Mantén copias digitales en la nube. Inspectores pueden solicitarlas sin aviso.

---

## 🛠️ Implementación Técnica

### Archivos a Crear/Modificar:

1. **`components/FAQSection.tsx`** ✅ (Ya existe, reutilizar)
   - Componente accordion colapsable
   - Props: `title`, `faqs[]`, `className`

2. **`App.tsx`** (Modificar)
   - Agregar sección FAQ después de Services Grid
   - Import FAQSection component
   - Data: Array de 20-25 FAQs categorizadas

3. **`index.html`** (Modificar)
   - Actualizar Schema.org: agregar `@type: ["LocalBusiness", "FAQPage"]`
   - Agregar `mainEntity` con todas las preguntas

4. **`constants.ts` o nuevo `faqData.ts`** (Crear)
   - Centralizar FAQs en un archivo
   - Estructura: `{ category, question, answer, tags[] }`

### Estructura de Datos:
```typescript
interface FAQ {
  category: 'Grease Trap' | 'UCO' | 'Compliance' | 'Best Practices';
  question: string;
  answer: string; // HTML permitido
  tags: string[]; // Para filtering futuro
}

export const faqs: FAQ[] = [
  {
    category: 'Grease Trap',
    question: '¿Cada cuánto debo limpiar mi grease trap?',
    answer: '<p>La frecuencia depende...</p>',
    tags: ['frequency', 'regulation', 'health-dept']
  },
  // ... más FAQs
];
```

---

## 📊 Impacto Esperado (Sin Multi-Page)

### SEO:
- ✅ FAQPage Schema en homepage
- ✅ Rich snippets en Google (FAQ boxes)
- ✅ Single page = más link equity concentrado
- ✅ Más rápido de indexar (1 página vs. 5)

### AI Discovery:
- ✅ LLMs pueden citar FAQs específicas
- ✅ Información contextual (regulaciones + best practices)
- ✅ Keywords naturales en respuestas

### UX:
- ✅ Todo en una página = menos navigation friction
- ✅ FAQs colapsables = scannable
- ✅ Searchable con Ctrl+F

---

## ✅ Checklist de Implementación

### Fase 1: Contenido
- [ ] Escribir 20-25 FAQs (5-6 por servicio principal)
- [ ] Incluir regulaciones específicas (LA County, California codes)
- [ ] Agregar best practices
- [ ] Citar fuentes (Health Dept, NFPA, etc.)

### Fase 2: Código
- [ ] Crear `faqData.ts` con todas las preguntas
- [ ] Modificar `App.tsx` para incluir FAQ section
- [ ] Reutilizar `FAQSection.tsx` (ya existe)
- [ ] Actualizar Schema.org en `index.html`

### Fase 3: Testing
- [ ] Validar Schema en validator.schema.org
- [ ] Test accordion functionality
- [ ] Test mobile responsive
- [ ] Verificar que no haya errores ARIA

### Fase 4: Deploy
- [ ] Build sin errores
- [ ] Push a producción
- [ ] Submit a Google Search Console
- [ ] Test con ChatGPT después de ~1 semana

---

## 🎯 Ventajas de Este Enfoque

1. **Simplicidad**: Una sola página, más fácil de mantener
2. **SEO Consolidado**: Todo el link equity en homepage
3. **UX Clara**: No confunde con navegación multi-page
4. **AI-Friendly**: FAQPage schema + contenido estructurado
5. **Performance**: Menos páginas = menos build size

---

**¿Procedemos con esta implementación?**
