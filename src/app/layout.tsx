import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { SearchProvider } from "@/components/SearchProvider";
import { LocaleProvider } from "@/components/LocaleContext";
import { AdminProvider } from "@/components/AdminProvider";
import { TopBar } from "@/components/TopBar";
import { isAdmin } from "@/lib/admin-auth";
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

/**
 * Lê o cookie de sessão (torna a rota dinâmica — ver a doc de `cookies` em
 * node_modules/next/dist/docs). Isolado num componente próprio, dentro do seu
 * próprio <Suspense>, porque a doc de `loading.js` é explícita: acesso a dado
 * de runtime (cookies/headers) direto no corpo do layout não é coberto pelo
 * Suspense implícito do loading.tsx, que só envolve page.tsx — e isso
 * bagunçava o streaming da página (dois <main> no HTML, um deles órfão,
 * nunca trocado para o conteúdo real). Isolar aqui resolveu.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return <AdminProvider isAdmin={admin}>{children}</AdminProvider>;
}

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
        <Suspense fallback={null}>
          <AdminGate>
            <LocaleProvider>
              <SearchProvider>
                <TopBar />
                {children}
              </SearchProvider>
            </LocaleProvider>
          </AdminGate>
        </Suspense>
      </body>
    </html>
  );
}
