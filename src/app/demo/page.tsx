"use client";

import dynamic from "next/dynamic";

const BackgroundPaths = dynamic(
  () => import("@/components/ui/modern-background-paths"),
  { ssr: false }
);

export default function DemoPage() {
  return <BackgroundPaths title="Anutec Taps" />;
}
