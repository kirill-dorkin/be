"use client";

import BaseContainer from "@/components/BaseContainer";
import Link from "next/link";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/home/LeafletMap"), { ssr: false });

export default function Contacts() {
  return (
    <section id="contacts" className="py-20">
      <BaseContainer className="space-y-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold">Контакты</h2>
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <p>Кулатова 8/1, Бишкек</p>
            <p>
              <a href="tel:+996501313114" className="underline">
                +996 501‑31‑31‑14
              </a>{" "}
              |{" "}
              <a href="tel:+996557313114" className="underline">
                +996 557‑31‑31‑14
              </a>
            </p>
            <p>
              <Link
                href="https://go.2gis.com/"
                className="underline"
                target="_blank"
              >
                Посмотреть на карте
              </Link>
            </p>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow">
            <Map />
          </div>
        </div>
      </BaseContainer>
    </section>
  );
}
