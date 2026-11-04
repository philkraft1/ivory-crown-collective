import type { Metadata } from "next";
import { MonthlyCare } from "@/components/MonthlyCare";
import { CARE_IMAGES } from "@/lib/care";
import { CARE_DOOR } from "@/lib/site";

export const metadata: Metadata = {
  title: CARE_DOOR.title,
  description: CARE_DOOR.lede,
  alternates: { canonical: CARE_DOOR.href },
  openGraph: {
    title: CARE_DOOR.title,
    description: CARE_DOOR.lede,
    images: [
      {
        url: CARE_IMAGES.packages.src,
        width: CARE_IMAGES.packages.width,
        height: CARE_IMAGES.packages.height,
        alt: CARE_IMAGES.packages.alt,
      },
    ],
  },
};

export default function MonthlyCarePage() {
  return <MonthlyCare />;
}
