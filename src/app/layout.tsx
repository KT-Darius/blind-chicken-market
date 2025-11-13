import Navigation from "@/components/common/navigation";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/user/useAuth";

export const metadata: Metadata = {
  title: "Blind Chicken Market",
  description: "Anonymous auction platform for second-hand goods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
          <footer>
            <div>© 2025 Darius Team</div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
