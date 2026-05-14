'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const VISITOR_KEY = 'lnakri_visitor_id';

function getVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

function shouldTrackPath(pathname: string) {
  return !pathname.startsWith('/admin-dashboard-content-management-panel');
}

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !shouldTrackPath(pathname)) return;

    const queryString = searchParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    const payload = JSON.stringify({
      path: fullPath,
      title: document.title,
      referrer: document.referrer,
      visitorId: getVisitorId(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/analytics/track',
        new Blob([payload], { type: 'application/json' })
      );
      return;
    }

    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}
