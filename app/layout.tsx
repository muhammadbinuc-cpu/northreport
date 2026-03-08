import type { Metadata } from "next";
import { Halant } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";

const halant = Halant({
  variable: "--font-halant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NorthReport — Community-Powered Urban Intelligence",
  description: "Your city's pulse, reported by the people who live in it. NorthReport turns local voices into real change.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={halant.variable}>
      <body className="antialiased">
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
