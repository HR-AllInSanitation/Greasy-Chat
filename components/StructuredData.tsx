import React from 'react';

interface StructuredDataProps {
  data: object;
}

const DEFAULT_ARTICLE_DATE_PUBLISHED = '2025-01-01';
const DEFAULT_ARTICLE_DATE_MODIFIED = '2026-04-02';

const enrichStructuredData = (input: any) => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (input['@type'] !== 'Article') {
    return input;
  }

  return {
    ...input,
    author: {
      '@type': 'Organization',
      name: 'LA Restaurant Services',
      url: 'https://www.larestaurantservices.com/about-us',
      ...(input.author || {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'LA Restaurant Services',
      url: 'https://www.larestaurantservices.com',
      logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
      ...(input.publisher || {}),
    },
    datePublished: input.datePublished || DEFAULT_ARTICLE_DATE_PUBLISHED,
    dateModified: input.dateModified || DEFAULT_ARTICLE_DATE_MODIFIED,
  };
};

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  const normalizedData = enrichStructuredData(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalizedData) }}
    />
  );
};

// Schema builders for common types
export const buildLocalBusinessSchema = (overrides: Partial<any> = {}) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.larestaurantservices.com/#organization",
  "name": "LA Restaurant Services",
  "image": "https://www.larestaurantservices.com/brand-hero.svg",
  "logo": "https://www.larestaurantservices.com/brand-hero.svg",
  "url": "https://www.larestaurantservices.com",
  "telephone": "+1-818-698-4252",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "13141 San Fernando Rd",
    "addressLocality": "Sylmar",
    "addressRegion": "CA",
    "postalCode": "91342",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 34.3089,
    "longitude": -118.4409
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "sameAs": [
    "https://www.facebook.com/larestaurantservices",
    "https://twitter.com/larestaurantservices"
  ],
  ...overrides
});

const buildAreaServedPlace = (area: string) => {
  const normalized = area.trim().toLowerCase();
  const isAdministrativeArea = normalized.includes('county') || normalized === 'southern california';
  return {
    "@type": isAdministrativeArea ? "AdministrativeArea" : "City",
    "name": area,
  };
};

export const buildServiceSchema = (service: {
  name: string;
  description: string;
  areaServed: string[];
  serviceType?: string;
  url?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": service.serviceType || service.name,
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://www.larestaurantservices.com/#organization",
    "name": "LA Restaurant Services"
  },
  "areaServed": service.areaServed.map(area => buildAreaServedPlace(area)),
  "url": service.url || "https://www.larestaurantservices.com"
});

export const buildFAQPageSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const buildBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
