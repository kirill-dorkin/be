"use client";

import Spinner from "@/components/ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <Spinner />
    </div>
  );
}