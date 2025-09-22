import Hero from "@/shared/ui/home/Hero";
import { PageSuspense } from "@/shared/ui/PageSuspense";

export default function Home() {
  return (
    <PageSuspense>
      <Hero />
    </PageSuspense>
  );
}
