"use client";

import type Error from "next/error";
import { memo, useEffect, useState } from "react";

import { errorService } from "@/services/error";

const GlobalErrorComponent = ({ error }: { error: Error }) => {
  const [traceId, setTraceId] = useState<string | null>(null);

  useEffect(() => {
    setTraceId(errorService.logError(error));
  }, [error]);

  return (
    <html>
      <body>Error: {traceId}</body>
    </html>
  );
};

// Мемоизация - global error page
export default memo(GlobalErrorComponent, (prevProps, nextProps) => {
  return prevProps.error === nextProps.error;
});
