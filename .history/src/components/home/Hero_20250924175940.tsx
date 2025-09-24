"use client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { usePerformance } from "@/shared/lib/usePerformance";
import { Section } from "@/shared/ui/launchui";

import OptimizedLink from "@/shared/ui/OptimizedLink";

const Hero: React.FC = () => {
  
  // Инициализируем хук производительности
  usePerformance();

  
  const handleLogout = () => {
    signOut();
  };

  return (
    