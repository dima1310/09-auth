// app/layout.tsx
import type { ReactNode } from "react";
import { Metadata } from "next";
import { Roboto } from "next/font/google";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NoteHub",
  description:
    "NoteHub helps you create and organize notes with category filters. Quick search and clean design for work and study.",
  openGraph: {
    title: "NoteHub",
    description:
      "NoteHub helps you create and organize notes by filtering by category. Quick search, clean design — ideal for work, study, and brainstorming.",
    siteName: "NoteHub",
    url: "https://09-auth.vercel.app",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub - Manage your notes efficiently",
      },
    ],
    type: "website",
  },
};

interface LayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: LayoutProps) {
  return (
    <html
      lang="en"
      className={roboto.className}
      suppressHydrationWarning={true}
    >
      <body>
        <TanStackProvider>
          <AuthProvider>
            <div className="container">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>

            {modal}
            <div id="modal-root" />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
