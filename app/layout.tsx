// app/layout.tsx

import "./globals.css";

export const metadata = {
  title: "NoteHub - Personal Note Taking App",
  description:
    "Secure personal note-taking application with user authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
