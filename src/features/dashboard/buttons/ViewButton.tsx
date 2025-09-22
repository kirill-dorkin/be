"use client";
import { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Icons } from '@/shared/ui/icons';

export default function ViewButton({ href }: { href: string }): ReactElement {
  return (
    <Button asChild size="sm" variant="ghost" className="bg-transparent">
      <Link href={href}>
        <Icons.view />
      </Link>
    </Button>
  );
}
