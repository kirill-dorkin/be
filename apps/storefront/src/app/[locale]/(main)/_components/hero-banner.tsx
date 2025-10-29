import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { createFieldsMap, type FieldsMap } from "@/lib/cms";
import { paths } from "@/lib/paths";

export const HeroBanner = async ({
  fields,
}: {
  fields: PageField[] | undefined;
}) => {
  const t = await getTranslations("home");

  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  const header = fieldsMap["homepage-banner-header"]?.text;
  const buttonText = fieldsMap["homepage-banner-button-text"]?.text;
  const image = fieldsMap["homepage-banner-image"]?.imageUrl;

  return (
    <section className="mt-12 mb-14 w-full px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-muted shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 sm:flex-row">
        <div className="order-last flex flex-1 flex-col justify-center gap-8 p-8 sm:order-first sm:p-10 lg:p-14">
          <h1 className="text-3xl font-semibold leading-tight hyphens-auto break-words text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
            {header}
          </h1>
          <Button asChild className="dark:hover:bg-stone-100">
            <LocalizedLink href={paths.search.asPath()}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-5" />
            </LocalizedLink>
          </Button>
        </div>
        <div className="order-first flex-1 sm:order-last">
          <div className="relative h-56 w-full sm:h-full sm:min-h-[22rem] lg:min-h-[24rem]">
            <Image
              src={image ?? ""}
              alt={t("hero-banner-alt")}
              sizes="(max-width: 720px) 100vw, 50vw"
              priority
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
