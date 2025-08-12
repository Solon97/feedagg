import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { SelectedItemProvider } from "@/contexts/selected-item-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DevLogger } from "@/components/dev-logger";
import { DevEmailLogin } from "@/components/dev-email-login";
import { SwUpdater } from "@/components/sw-updater";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeedAgg - O conteúdo que importa",
  description:
    "Agregue e gerencie seus feeds RSS e canais do YouTube em um só lugar",
  generator: "v0.dev",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FeedAgg",
  },
  applicationName: "FeedAgg",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SelectedItemProvider>
              {children}
              {/* SW update toast controller */}
              <SwUpdater />
              <Toaster />
              <DevLogger />
              <DevEmailLogin />
            </SelectedItemProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
