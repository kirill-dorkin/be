import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { generateStandardPDPMetadata } from "@/pdp/views/standard";

const PDPSkeleton = () => (
  <div className="container animate-pulse space-y-6 py-8">
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="bg-muted aspect-square w-full rounded-lg" />
      <div className="space-y-4">
        <div className="bg-muted h-8 w-3/4 rounded" />
        <div className="bg-muted h-4 w-1/2 rounded" />
        <div className="bg-muted h-24 w-full rounded" />
        <div className="bg-muted h-12 w-full rounded" />
      </div>
    </div>
  </div>
);

const StandardPDPView = dynamic(
  () => import("@/pdp/views/standard").then((mod) => mod.StandardPDPView),
  { loading: () => <PDPSkeleton /> },
);

const CustomPDPView = dynamic(
  () => import("@/pdp/views/custom").then((mod) => mod.CustomPDPView),
  { loading: () => <PDPSkeleton /> },
);

export const generateMetadata = generateStandardPDPMetadata;

export default async function ProductPage(props: any) {
  // This is just a temporary solution to determine the layout.
  const pdpLayout = (await cookies()).get("PDP_LAYOUT")?.value;

  if (pdpLayout === "CUSTOM") {
    return <CustomPDPView {...props} />;
  }

  // Fallback to standard layout
  return <StandardPDPView {...props} />;
}
