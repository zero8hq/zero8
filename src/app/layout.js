import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navigation from "@/components/ui/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZER08 | API-First Webhook Scheduling Platform",
  description:
    "Schedule webhooks with precision. ZER08 is the modern scheduling platform for businesses that need reliable API callbacks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
