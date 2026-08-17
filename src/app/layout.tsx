import type { Metadata } from "next";
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

// Ler o cookie de sessão aqui torna as rotas dinâmicas (ver a doc de
// `cookies` em node_modules/next/dist/docs). É uma troca consciente: o
// alternativo seria descobrir o modo admin no cliente, o que faria os
// controles de edição piscarem na tela a cada carregamento. A cota do Apps
// Script segue protegida — quem cacheia a leitura da planilha é
// `unstable_cache` em getApps(), não o cache de rota.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const admin = await isAdmin();

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
        <AdminProvider isAdmin={admin}>
          <LocaleProvider>
            <SearchProvider>
              <TopBar />
              {children}
            </SearchProvider>
          </LocaleProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
