import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { SearchProvider } from "@/components/SearchProvider";
import { LocaleProvider } from "@/components/LocaleContext";
import { TopBar } from "@/components/TopBar";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Q",
  description: "Hub central de acesso aos sistemas da Qualidade.",
};

// Roda antes da hidratação (ver next/script beforeInteractive) para aplicar
// a preferência salva sem flash de tema errado. A chave precisa bater com
// THEME_STORAGE_KEY em src/lib/theme.ts.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <LocaleProvider>
          <SearchProvider>
            <TopBar />
            {children}
          </SearchProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
