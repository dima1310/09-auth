// app/(private-routes)/layout.tsx

import AuthProvider from "../../components/AuthProvider/AuthProvider";
import QueryProvider from "../../components/QueryProvider/QueryProvider";
import Header from "../../components/Header/Header";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Header />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
