import { Sora, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata = {
  title: "HireSphere | Find and Hire Top Influencers",
  description: "Connect with thousands of vetted Instagram, TikTok, and YouTube creators.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HireSphere",
  },
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${bricolage.variable}`}>
      <body className="antialiased font-sans">
        <Providers>
          {children}
          <Toaster richColors position="top-right" duration={2000}  />
        </Providers>
      </body>
    </html>
  );
}
