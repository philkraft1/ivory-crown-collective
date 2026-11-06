import type { Metadata } from "next";
import { WheelHostConsole } from "@/components/WheelHostConsole";

export const metadata: Metadata = {
  title: "Wheel of Fortune Host Console",
  description:
    "Host controls and voice announcements for the Ivory Crown Collective Wheel of Fortune TikTok Live game.",
  robots: { index: false, follow: false },
};

export default function WheelHostPage() {
  return <WheelHostConsole />;
}
