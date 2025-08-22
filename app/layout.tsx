// app/layout.tsx

import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { TanStackProvider } from '@/components/TanStackProvider/TanStackProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'A simple notes application with authentication',
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
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
