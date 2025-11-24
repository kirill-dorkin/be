import {
  Crown,
  Package,
  Shield,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const features = [
  {
    icon: Package,
    titleKey: "features.catalog.title" as const,
    descriptionKey: "features.catalog.description" as const,
    href: paths.search.asPath(),
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Wrench,
    titleKey: "features.repair.title" as const,
    descriptionKey: "features.repair.description" as const,
    href: paths.services.asPath(),
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Crown,
    titleKey: "features.membership.title" as const,
    descriptionKey: "features.membership.description" as const,
    href: paths.membership.asPath(),
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Truck,
    titleKey: "features.delivery.title" as const,
    descriptionKey: "features.delivery.description" as const,
    href: paths.search.asPath(),
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Shield,
    titleKey: "features.warranty.title" as const,
    descriptionKey: "features.warranty.description" as const,
    href: paths.search.asPath(),
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Sparkles,
    titleKey: "features.quality.title" as const,
    descriptionKey: "features.quality.description" as const,
    href: paths.search.asPath(),
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

export async function FeaturesSection() {
  const t = await getTranslations("home");

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("features.heading")}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t("features.subheading")}
          </p>
        </div>

        {/* Features grid - Clean minimalist style */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <LocalizedLink
              key={feature.titleKey}
              href={feature.href}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:shadow-lg"
            >
              <div className="space-y-4">
                {/* Icon - Simple and clean */}
                <div className="inline-flex">
                  <feature.icon className={`h-8 w-8 ${feature.iconColor} transition-transform group-hover:scale-110`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </div>

              {/* Subtle hover indicator */}
              <div className="absolute bottom-6 right-6 opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}
