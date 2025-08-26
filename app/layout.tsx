import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import TanStackProvider from "../components/TanStackProvider/TanStackProvider";
import AuthProvider from "../components/AuthProvider/AuthProvider";

export const metadata: Metadata = {
  title: "NoteHub - Your Personal Note Taking App",
  description:
    "Create, organize, and manage your notes with NoteHub. A modern note-taking application built with Next.js.",
  keywords: "notes, note-taking, productivity, organization, Next.js",
  authors: [{ name: "NoteHub Team" }],
  viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <TanStackProvider>
          <AuthProvider>
            <div id="app-container">
              <Header />

              <main id="main-content">{children}</main>

              <Footer />

              {/* Модальные окна из parallel routes */}
              <div id="modal-container">{modal}</div>
            </div>
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
