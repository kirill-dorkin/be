"use client";

import dynamic from "next/dynamic";

const ContactMap = dynamic(() => import("./contact-map").then((mod) => mod.ContactMap), {
  ssr: false,
});

export function ContactMapContainer() {
  return <ContactMap />;
}
