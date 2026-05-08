import React from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollManager: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToTarget = () => {
      if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const frame = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return null;
};
