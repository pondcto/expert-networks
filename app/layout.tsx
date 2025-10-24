import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./providers/client-providers";

export const metadata: Metadata = {
  title: "Windshift Expert Networks UI",
  description: "AI-powered research automation with beautiful Windshift design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
