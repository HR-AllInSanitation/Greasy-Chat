import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { RouteMetadata } from './RouteMetadata';
import { ArticleAIOPanel } from './ArticleAIOPanel';
import { ScrollManager } from './ScrollManager';
import { inferServiceContext, trackLeadEvent } from '../api/gtag-utils';

export const SiteLayout: React.FC = () => {
  const location = useLocation();
  const showGlobalArticlePanel = location.pathname !== '/la-fog-program-explained';

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const normalizeText = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim();
    const currentPath = `${location.pathname}${location.search}`;
    const serviceContext = inferServiceContext(location.pathname);

    const isQuoteCta = (element: HTMLElement): boolean => {
      const text = normalizeText(element.textContent).toLowerCase();
      const quoteLabel = /request service|request a quote|get instant estimate|get estimate|instant estimate|get your quote|book consultation/.test(text);

      if (element instanceof HTMLAnchorElement) {
        const href = (element.getAttribute('href') || '').toLowerCase();
        const quoteHref = href.includes('/instant-estimate') || href.includes('service=');
        return quoteLabel || quoteHref;
      }

      return quoteLabel;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a,button') as HTMLElement | null;
      if (!interactive) return;

      // Capture any tel link click as a phone-call intent event.
      if (interactive instanceof HTMLAnchorElement) {
        const href = interactive.getAttribute('href') || '';
        if (href.toLowerCase().startsWith('tel:')) {
          const phoneNumber = href.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
          trackLeadEvent('phone_call_click', {
            phone_number: phoneNumber || undefined,
            page_path: currentPath,
            link_text: normalizeText(interactive.textContent) || undefined,
            service_context: serviceContext,
          });
          return;
        }
      }

      // Quote CTA click is tracked as a secondary intent event.
      if (isQuoteCta(interactive)) {
        trackLeadEvent('request_quote_click', {
          page_path: currentPath,
          link_text: normalizeText(interactive.textContent) || undefined,
          service_context: serviceContext,
          destination: interactive instanceof HTMLAnchorElement ? interactive.getAttribute('href') || undefined : undefined,
        });
      }
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFDFF]">
      <RouteMetadata />
      <ScrollManager />
      <SiteHeader />
      {showGlobalArticlePanel ? <ArticleAIOPanel /> : null}
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
};
