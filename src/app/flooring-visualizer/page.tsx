import React from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import FlooringVisualizerPageClient from "@/components/usa/FlooringVisualizerPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host")?.toLowerCase() || "";
  const isUS = host.startsWith("us.") || host.includes("us.localhost");

  return {
    title: "Interactive Flooring Visualizer (LVP, Hardwood, Tile & Carpet) | HDE USA",
    description:
      "Preview Honey Oak Hardwood, Herringbone Walnut, Weathered LVP, Porcelain Tile, and Carpet in real Living Room and Kitchen scenes before installing.",
    alternates: {
      canonical: "https://us.homedesignenglish.com/flooring-visualizer",
    },
    robots: isUS ? undefined : { index: false, follow: true },
    openGraph: {
      title: "Interactive Flooring Visualizer | HDE USA",
      description:
        "Switch between Living Room and Kitchen scenes to preview US hardwood, LVP, carpet, and tile finishes.",
      url: "https://us.homedesignenglish.com/flooring-visualizer",
      type: "website",
    },
  };
}

export default function FlooringVisualizerPage() {
  return <FlooringVisualizerPageClient />;
}
