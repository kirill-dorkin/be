"use client";
import { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MdRemoveRedEye } from "react-icons/md";

export default function ViewButton({ href }: { href: string }): ReactElement {
  return (
    <Button asChild size="sm" variant="ghost" className="bg-transparent">
      <Link href={href}>
        <MdRemoveRedEye className="text-foreground text-lg" />
      </Link>
    </Button>
  );
}
