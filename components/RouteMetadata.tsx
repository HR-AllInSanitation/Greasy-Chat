import React from 'react';
import { useLocation } from 'react-router-dom';
import { getEstimatorServiceByKey } from '../data/serviceOptions';

type RouteMeta = {
  title: string;
  description: string;
  canonicalPath?: string;
};

const SITE_URL = 'https://www.larestaurantservices.com';
const DEFAULT_META: RouteMeta = {
  title: 'LA Restaurant Services | Los Angeles Restaurant Waste & Sanitation',
  description:
    'Grease trap service, hydro jetting, UCO recycling, restroom rentals, and restaurant sanitation support for Los Angeles and Southern California businesses.',
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'LA Restaurant Services | Los Angeles Restaurant Waste & Sanitation',
    description:
      'Request grease trap pumping, hydro jetting, UCO recycling, compliance help, and restaurant sanitation support across Los Angeles and Southern California.',
    canonicalPath: '/',
  },
  '/instant-estimate': {
    title: 'Instant Estimate | LA Restaurant Services',
    description:
      'Use the structured form to request a fast restaurant service estimate, call dispatch, or send a message for follow-up.',
    canonicalPath: '/instant-estimate',
  },
  '/faq': {
    title: 'Restaurant Waste Services FAQ | LA Restaurant Services',
    description:
      'Frequently asked questions about grease trap pumping, compliance, hydro jetting, UCO recycling, and dispatch timing in Los Angeles.',
    canonicalPath: '/faq',
  },
  '/about-us': {
    title: 'About LA Restaurant Services | Restaurant Waste & Sanitation Team',
    description:
      'Learn about LA Restaurant Services, our dispatch-first operating model, and how we support restaurant sanitation and compliance workflows.',
    canonicalPath: '/about-us',
  },
  '/best-practices': {
    title: 'Restaurant Waste Best Practices | LA Restaurant Services',
    description:
      'Operational best practices for grease traps, FOG control, manifests, and service planning for restaurant operators.',
    canonicalPath: '/best-practices',
  },
  '/environmental-impact': {
    title: 'Environmental Impact Guide for Restaurant Waste | LA Restaurant Services',
    description:
      'How restaurants reduce environmental impact through grease control, documentation, and used cooking oil recycling.',
    canonicalPath: '/environmental-impact',
  },
  '/grease-trap-cleaning-los-angeles': {
    title: 'Grease Trap Cleaning Los Angeles | LA Restaurant Services',
    description:
      'Grease trap and interceptor pumping for restaurants in Los Angeles with full scraping, manifests, and fast dispatch support.',
  },
  '/used-cooking-oil-pickup-los-angeles': {
    title: 'Used Cooking Oil Pickup Los Angeles | LA Restaurant Services',
    description:
      'Used cooking oil pickup and recycling for restaurants in Los Angeles with containers, scheduled collection, and compliance records.',
  },
  '/restroom-trailer-rentals-los-angeles': {
    title: 'Restroom Trailer Rentals Los Angeles | LA Restaurant Services',
    description:
      'Portable restroom trailer rentals for restaurant events, renovations, and temporary service needs in Los Angeles.',
  },
  '/restaurant-waste-services': {
    title: 'Restaurant Waste Services Los Angeles | LA Restaurant Services',
    description:
      'All-in-one restaurant waste services including grease trap pumping, UCO recycling, hydro jetting, septic pumping, and compliance support.',
    canonicalPath: '/restaurant-waste-services',
  },
  '/septic-holding-tank-pumping-los-angeles': {
    title: 'Septic & Holding Tank Pumping Los Angeles | LA Restaurant Services',
    description:
      'Restaurant septic and holding tank pumping with dispatch coordination, maintenance scheduling, and compliance-focused follow-up.',
  },
  '/hydro-jetting-los-angeles': {
    title: 'Hydro Jetting Los Angeles | LA Restaurant Services',
    description:
      'Hydro jetting for restaurant sewer and kitchen drain lines in Los Angeles with fast dispatch support for recurring backups.',
  },
  '/compliance-audits-los-angeles': {
    title: 'Compliance Audits Los Angeles | LA Restaurant Services',
    description:
      'Restaurant compliance audit support, documentation review, and dispatch follow-up for Los Angeles operators.',
  },
  '/hood-cleaning-los-angeles': {
    title: 'Hood Cleaning Los Angeles | LA Restaurant Services',
    description:
      'Kitchen hood cleaning for restaurants in Los Angeles with scheduling support, recurring service plans, and dispatch follow-up.',
  },
  '/janitorial-services-los-angeles': {
    title: 'Janitorial Services Los Angeles | LA Restaurant Services',
    description:
      'Restaurant janitorial services in Los Angeles for kitchens, dining rooms, and restrooms with custom sanitation programs.',
  },
  '/how-a-grease-trap-works': {
    title: 'How a Grease Trap Works | LA Restaurant Services',
    description:
      'A plain-language explanation of grease trap anatomy, separation layers, service thresholds, and compliance implications.',
  },
  '/which-restaurants-need-grease-traps-los-angeles': {
    title: 'Which Restaurants in Los Angeles Need Grease Traps? | LA Restaurant Services',
    description:
      'Learn which Los Angeles restaurants and commercial kitchens may need grease traps or interceptors, FOG compliance requirements, and when to request grease trap service.',
  },
  '/how-to-tell-if-grease-trap-was-serviced': {
    title: 'How to Tell If a Grease Trap Was Serviced | LA Restaurant Services',
    description:
      'Signs a grease trap was actually serviced, what to inspect, and what documentation operators should expect after pumping.',
  },
  '/grease-trap-cleaning-frequency-guide': {
    title: 'Grease Trap Cleaning Frequency Guide | LA Restaurant Services',
    description:
      'How often restaurants should clean grease traps based on kitchen volume, trap size, and risk tolerance.',
  },
  '/fats-oils-grease-sewer-impact-los-angeles': {
    title: 'FOG Sewer Impact in Los Angeles | LA Restaurant Services',
    description:
      'How fats, oils, and grease affect sewer systems in Los Angeles and why restaurants need preventive service and documentation.',
  },
  '/la-restaurant-health-inspection-guide': {
    title: 'LA Restaurant Health Inspection Guide | LA Restaurant Services',
    description:
      'Health inspection guidance for restaurant operators in Los Angeles, including grease trap compliance and service documentation.',
  },
  '/la-fog-program-explained': {
    title: 'LA FOG Program Explained | LA Restaurant Services',
    description:
      'A simple explanation of the Los Angeles FOG program, what operators are expected to do, and how service records support compliance.',
  },
  '/grease-trap-waste-manifest-explained': {
    title: 'Grease Trap Waste Manifest Explained | LA Restaurant Services',
    description:
      'What a grease trap waste manifest includes, why inspectors ask for it, and how to keep records organized.',
  },
  '/restaurant-fog-violations-fines-los-angeles': {
    title: 'Restaurant FOG Violations and Fines Los Angeles | LA Restaurant Services',
    description:
      'Common FOG compliance failures, violation risks, and the operational cost of delayed grease trap service in Los Angeles.',
  },
  '/new-restaurant-grease-trap-compliance-la': {
    title: 'New Restaurant Grease Trap Compliance LA | LA Restaurant Services',
    description:
      'A startup guide to grease trap compliance for new restaurants opening in Los Angeles.',
  },
  '/goslyn-installation-los-angeles': {
    title: 'Goslyn Installation Los Angeles | Zero-Maintenance Option',
    description:
      'Compare recurring pumping with Goslyn high-efficiency filtration and request a consultation for retrofit planning in Los Angeles.',
    canonicalPath: '/goslyn-installation-los-angeles',
  },
};

const upsertMeta = (key: string, content: string, useProperty = false) => {
  const selector = useProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (useProperty) element.setAttribute('property', key);
    else element.setAttribute('name', key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const getInstantEstimateMeta = (search: string): RouteMeta => {
  const params = new URLSearchParams(search);
  const serviceKey = params.get('service');
  const service = getEstimatorServiceByKey(serviceKey);
  if (!service) return ROUTE_META['/instant-estimate'];

  return {
    title: `${service.label} | Instant Estimate | LA Restaurant Services`,
    description: `Request a structured estimate for ${service.label.toLowerCase()}, call dispatch, or send a message for follow-up.`,
    canonicalPath: '/instant-estimate',
  };
};

export const RouteMetadata: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const meta = location.pathname === '/instant-estimate'
      ? getInstantEstimateMeta(location.search)
      : (ROUTE_META[location.pathname] || DEFAULT_META);

    const canonicalUrl = `${SITE_URL}${meta.canonicalPath ?? location.pathname}`;
    document.title = meta.title;
    upsertMeta('description', meta.description);
    upsertMeta('robots', 'index,follow');
    upsertMeta('og:site_name', 'LA Restaurant Services', true);
    upsertMeta('og:type', 'website', true);
    upsertMeta('og:title', meta.title, true);
    upsertMeta('og:description', meta.description, true);
    upsertMeta('og:url', canonicalUrl, true);
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', meta.title);
    upsertMeta('twitter:description', meta.description);
    upsertCanonical(canonicalUrl);
  }, [location.pathname, location.search]);

  return null;
};
