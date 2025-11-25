"use client";

import { Download, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

type QRCodeInstance = {
  append: (element: HTMLElement) => void;
  download: (options?: { extension?: string; name?: string }) => void;
  update: (options: { data?: string }) => void;
};

interface QRCodeGeneratorProps {
  referralLink: string;
}

export function QRCodeGenerator({ referralLink }: QRCodeGeneratorProps) {
  const t = useTranslations();
  const [qrCode, setQrCode] = useState<QRCodeInstance | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");

      if (isCancelled) {
        return;
      }

      const instance = new QRCodeStyling({
        width: 300,
        height: 300,
        data: referralLink,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
        },
        dotsOptions: {
          type: "rounded",
          color: "#7c3aed",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#7c3aed",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#7c3aed",
        },
      });

      setQrCode(instance as QRCodeInstance);
    };

    if (!qrCode && typeof window !== "undefined") {
      void load();
    }

    return () => {
      isCancelled = true;
    };
  }, [qrCode, referralLink]);

  useEffect(() => {
    if (qrRef.current && qrCode) {
      qrCode.update({ data: referralLink });
      qrCode.append(qrRef.current);
    }
  }, [qrCode, referralLink]);

  const handleDownload = () => {
    if (!qrCode) {
      return;
    }

    void qrCode.download({
      name: "referral-qr-code",
      extension: "png",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          {t("referral.qr-code")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("referral.qr-code-title")}</DialogTitle>
          <DialogDescription>
            {t("referral.qr-code-description")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div
            ref={qrRef}
            className="rounded-2xl border-4 border-slate-200 bg-white p-4 dark:border-slate-800"
          />
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            {t("referral.download-qr")}
          </Button>
          <p className="text-center text-xs text-slate-600 dark:text-muted-foreground">
            {t("referral.qr-code-hint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
