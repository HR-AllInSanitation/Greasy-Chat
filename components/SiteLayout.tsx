import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { RouteMetadata } from './RouteMetadata';

export const SiteLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFDFF]">
      <RouteMetadata />
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
};
