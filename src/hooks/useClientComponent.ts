"use client";
import { useEffect, useState } from "react";

export default function useClientComponent(): boolean {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

