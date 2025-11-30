"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ReferralWelcomeModal } from "./welcome-modal";

interface ReferralWelcomeWrapperProps {
  clearQueryParam?: string;
  delayMs?: number;
  forceShow?: boolean;
  isNewUser?: boolean;
  referralCode: string;
}

const STORAGE_KEY = "referral_welcome_shown";

export function ReferralWelcomeWrapper({
  clearQueryParam,
  delayMs = 1000,
  forceShow = false,
  isNewUser = false,
  referralCode,
}: ReferralWelcomeWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if modal was already shown
    const wasShown = localStorage.getItem(STORAGE_KEY);

    // Show modal if it wasn't shown yet and user has a referral code
    if (!wasShown && referralCode && (isNewUser || forceShow)) {
      const timer = setTimeout(() => {
        setShowModal(true);

        if (clearQueryParam && router && pathname && searchParams) {
          const params = new URLSearchParams(searchParams.toString());

          params.delete(clearQueryParam);
          const queryString = params.toString();

          router.replace(queryString ? `${pathname}?${queryString}` : pathname);
        }
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [
    clearQueryParam,
    delayMs,
    forceShow,
    isNewUser,
    pathname,
    referralCode,
    router,
    searchParams,
  ]);

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <ReferralWelcomeModal
      isOpen={showModal}
      onClose={handleClose}
      referralCode={referralCode}
    />
  );
}
