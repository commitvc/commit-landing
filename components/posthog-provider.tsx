'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { type ReactNode, Suspense, useEffect } from 'react';

const POSTHOG_KEY = 'phc_rMfZzmKbhz3A85WNWbTNF3bPw3vM6bB4wX2PDHUDQwLc';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

let initialized = false;

function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
    if (!pathname) return;
    const url =
      window.location.origin + pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
