"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { useCurrentRegion } from "@/regions/client";

import { LocaleSwitchModal } from "./locale-modal";

export const LocaleSwitch = () => {
  const [showModal, setShowModal] = useState(false);
  const t = useTranslations("locale");
  const region = useCurrentRegion();

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-1.5"
        onClick={() => setShowModal(true)}
        aria-label={t("region-settings")}
      >
        <Globe className="h-4 w-4" /> {region.market.id.toLocaleUpperCase()}
      </Button>
      {showModal && <LocaleSwitchModal onClose={() => setShowModal(false)} />}
    </>
  );
};

LocaleSwitch.displayName = "LocaleSwitch";
