// app/layout.tsx

import { ReactNode } from "react";
import "./globals.css";
import { TanStackProvider } from "@/components/TanStackProvider/TanStackProvider";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

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
            <div id="root">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              {modal}
            </div>
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Notes App",
  description: "A simple notes application with authentication",
};
