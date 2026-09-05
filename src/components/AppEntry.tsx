import { Suspense } from 'react';
import { MainLayout } from '@/src/components/MainLayout';
import { Providers } from '@/src/components/Providers';
import type { MediaItem } from '@/src/types';

export function AppEntry({ initialMedia }: { initialMedia?: MediaItem }) {
  return (
    <Providers>
      <Suspense fallback={null}>
        <MainLayout initialMedia={initialMedia} />
      </Suspense>
    </Providers>
  );
}
