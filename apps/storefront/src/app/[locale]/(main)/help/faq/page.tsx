import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "help" });

  return {
    title: t("faq.meta.title"),
    description: t("faq.meta.description"),
  };
}

export default async function HelpFAQPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });

  const faq = (key: string) => t(`faq.${key}`);

  const faqGroups = (t.raw("faq.sections") as Array<{
    id: string;
    items: Array<{ answer: string, question: string; }>;
    title: string;
  }>) satisfies Array<{
    id: string;
    items: Array<{ answer: string, question: string; }>;
    title: string;
  }>;

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
            <HelpCircle className="h-4 w-4" />
            {faq("hero.badge")}
          </span>
          <span className="text-muted-foreground">{faq("hero.subtitle")}</span>
        </div>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          {faq("hero.title")}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          {faq("hero.description")}
        </p>
      </section>

      <section className="space-y-6">
        {faqGroups.map((group) => (
          <Card key={group.id} className="border border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircleQuestion className="h-5 w-5 text-primary" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {group.items.map((item) => (
                  <AccordionItem
                    key={item.question}
                    value={item.question}
                    className="border border-border/60 rounded-xl px-4"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
