"use client";

import { Download, QrCode } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

interface QRCodeGeneratorProps {
  referralLink: string;
}

const DynamicQRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border-4 border-slate-200 bg-white text-xs text-slate-500 dark:border-slate-800"
      aria-busy="true"
    >
      Loading QR...
    </div>
  ),
});

export function QRCodeGenerator({ referralLink }: QRCodeGeneratorProps) {
  const t = useTranslations();
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    const svg = qrWrapperRef.current?.querySelector("svg");

    if (!svg) {
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "referral-qr-code.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
            ref={qrWrapperRef}
            className="rounded-2xl border-4 border-slate-200 bg-white p-4 dark:border-slate-800"
          >
            <DynamicQRCode
              value={referralLink}
              size={220}
              level="Q"
              bgColor="#ffffff"
              fgColor="#4338ca"
            />
          </div>
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            {t("referral.download-qr")}
          </Button>
          <p className="dark:text-muted-foreground text-center text-xs text-slate-600">
            {t("referral.qr-code-hint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
