"use client";

import { useEffect, useState } from "react";

import { useRouter } from "@/i18n/routing";

export const useRouterWithState = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const push = (href: string, options?: { scroll?: boolean }) => {
    console.log("🟢 [Router] push called with:", href, options);
    setIsRedirecting(true);
    router.push(href, options);

    return;
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    console.log("🟢 [Router] replace called with:", href, options);
    setIsRedirecting(true);
    router.replace(href, options);

    return;
  };

  useEffect(() => {
    return () => {
      console.log("🟢 [Router] Component unmounting, resetting isRedirecting");
      setIsRedirecting(false);
    };
  }, []);

  console.log("🟡 [Router] Current state - isRedirecting:", isRedirecting);

  return { isRedirecting, push, replace };
};
