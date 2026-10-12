import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compartilhe suas Fotos | Casamento",
  description: "Faça o upload das fotos que você tirou no casamento diretamente para nós!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-stone-50 text-stone-900 pb-16">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
