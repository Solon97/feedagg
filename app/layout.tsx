import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { SelectedItemProvider } from "@/contexts/selected-item-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DevLogger } from "@/components/dev-logger";
import { DevEmailLogin } from "@/components/dev-email-login";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeedAgg - O conteúdo que importa",
  description:
    "Agregue e gerencie seus feeds RSS e canais do YouTube em um só lugar",
  generator: "v0.dev",
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
