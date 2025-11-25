"use client";

import { Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";
import { useToast } from "@nimara/ui/hooks";

import { ShareButtons } from "@/components/referral/share-buttons";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
}

export function ReferralLinkCard({ referralLink, referralCode }: ReferralLinkCardProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        description: t("referral.link-copied"),
        position: "center",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle>{t("referral.your-referral-link")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className={copied ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : ""}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {canShare && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ShareButtons referralLink={referralLink} referralCode={referralCode} />
      </CardContent>
    </Card>
  );
}
