"use client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import SignInLink from "./SignInLink";
import BaseContainer from "@/components/BaseContainer";
import AvatarMenu from "./AvatarMenu";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <BaseContainer className="flex items-center justify-between py-6 bg-secondary">
      <Link href="#" className="flex items-center gap-2" prefetch={false}>
        <span className="text-2xl font-semibold">Homestay</span>
      </Link>
      <div className="hidden md:flex gap-4">
        <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
          Home
        </Link>
        <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
          About
        </Link>
        <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
          Services
        </Link>
        <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
          Portfolio
        </Link>
        <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
          Contact
        </Link>
      </div>
      <div className="flex items-center gap-6 md:hidden">
        {session ? <AvatarMenu /> : <SignInLink />}
        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <RxHamburgerMenu className="text-4xl" />
              <span className="sr-only">Toggle navigation menu</span>
            </div>
          </SheetTrigger>
          <SheetContent side="left">
            <VisuallyHidden.Root>
              <SheetTitle>Menu</SheetTitle>
            </VisuallyHidden.Root>
            <div className="grid w-[200px] p-4">
              <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
                Home
              </Link>
              <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
                About
              </Link>
              <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
                Services
              </Link>
              <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
                Portfolio
              </Link>
              <Link href="#" className="text-lg font-medium hover:underline underline-offset-4" prefetch={false}>
                Contact
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </BaseContainer>
  );
}
