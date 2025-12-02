'use client';

import {
  MenuSection as HeadlessMenuSection,
  MenuHeading,
} from '@headlessui/react';
import type { ReactNode } from 'react';

export interface MenuSectionProps {
  title?: ReactNode;
  children: ReactNode;
}

export function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <HeadlessMenuSection>
      {title && (
        <MenuHeading className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </MenuHeading>
      )}
      {children}
    </HeadlessMenuSection>
  );
}
