import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Layout({ children }: LayoutProps<"/[locale]">) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-background sticky top-0 z-50 py-4">
        <Header />
      </div>
      <main className="container flex flex-1 flex-col items-center py-8 md:pt-10">
        <div className="w-full sm:max-w-[21rem] md:max-w-[24.5rem] xl:max-w-[25.375rem]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
