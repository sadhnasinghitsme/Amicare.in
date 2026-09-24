import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/layout/Analytics";
import { AnalyticsNoScript } from "@/components/layout/AnalyticsNoScript";
import { BRAND } from "@/lib/constants";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AmiCare Hospital, Indirapuram",
    template: "%s | AmiCare Hospital",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <AnalyticsNoScript />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
