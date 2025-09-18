'use client';

import { ContentManagement } from './content-management';

export default function ContentManagementWrapper({ className }: { className?: string }) {
  return <ContentManagement className={className} />;
}