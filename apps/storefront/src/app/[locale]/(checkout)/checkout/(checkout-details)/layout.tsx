import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/header/logo";
import { SideSummary } from "@/components/summary/side-summary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    robots: {
      follow: false,
      index: false,
      googleBot: {
        follow: false,
        index: false,
      },
    },
    title: t("common.checkout"),
  };
}

export default function Layout({
  children,
}: LayoutProps<"/[locale]/checkout">) {
  return (
    <section className="grid min-h-screen grid-cols-1 md:grid-cols-[3fr_2fr]">
      <div className="flex justify-center xl:mr-48 xl:justify-end">
        <main className="w-full max-w-md space-y-6 p-4 sm:p-6">
          <header className="flex w-full items-center justify-between border-b border-border/60 pb-5">
            <Logo />
            <div className="md:hidden">
              <SideSummary />
            </div>
          </header>
          <div className="flex flex-col gap-6">{children}</div>
        </main>
      </div>
      <aside className="hidden bg-gray-100 md:block dark:bg-stone-900">
        <SideSummary />
      </aside>
    </section>
  );
}
