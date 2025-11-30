"use client";

import { MessageCircle, Send, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { QRCodeGenerator } from "./qr-code-generator";

interface ShareButtonsProps {
  referralCode: string;
  referralLink: string;
}

export function ShareButtons({
  referralLink,
  referralCode,
}: ShareButtonsProps) {
  const t = useTranslations();
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const shareMessage = t("referral.share-message", {
    code: referralCode,
    link: referralLink,
  });

  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedLink = encodeURIComponent(referralLink);

  const shareLinks = useMemo(
    () => ({
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(t("referral.share-text"))}`,
      viber: `viber://forward?text=${encodedMessage}`,
    }),
    [encodedLink, encodedMessage, t],
  );

  const handleShare = () => {
    if (!canShare || typeof navigator === "undefined") {
      return;
    }

    void navigator
      .share({
        title: t("referral.share-title"),
        text: t("referral.share-text"),
        url: referralLink,
      })
      .catch(() => undefined);
  };

  return (
    <div className="space-y-3">
      <p className="dark:text-muted-foreground text-sm font-medium text-slate-700">
        {t("referral.quick-share")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2 rounded-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
        >
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400"
        >
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send className="h-4 w-4" />
            Telegram
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2 rounded-full border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400"
        >
          <a href={shareLinks.viber} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Viber
          </a>
        </Button>

        {canShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full"
          >
            <Share2 className="h-4 w-4" />
            {t("referral.share-more")}
          </Button>
        )}

        <QRCodeGenerator referralLink={referralLink} />
      </div>
    </div>
  );
}
