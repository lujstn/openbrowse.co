import type { Metadata } from "next";
import { site } from "@/content/landing";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.metaDescription,
  authors: [{ name: site.author, url: site.orcid }],
  creator: site.author,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: `${site.name}: ${site.tagline}`,
    description: site.abstract,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@lujstn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className="dark"
      data-theme="dark"
      data-astryx-theme="openbrowse"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-page text-body antialiased">
        {children}
      </body>
    </html>
  );
}
