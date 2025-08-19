// app/layout.tsx

import { ReactNode } from "react";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div id="root">
          {children}
          {modal}
        </div>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Notes App",
  description: "A simple notes application with authentication",
};
