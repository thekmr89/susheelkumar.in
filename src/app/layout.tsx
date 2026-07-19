import type { Metadata } from "next";
import { Playwrite_AU_SA, Mona_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { portfolioData } from "@/data/portfolio";

const playwrite = Playwrite_AU_SA({
  variable: "--font-playwrite",
  weight: ["400"],
  display: "swap",
});

const mona_sans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})


export const metadata: Metadata = {
  title: `${portfolioData.personalInfo.name} | ${portfolioData.personalInfo.role}`,
  description: portfolioData.personalInfo.tagline,
  keywords: [
    "Susheel Kumar",
    "Full Stack Engineer",
    "Next.js Developer",
    "React Developer",
    "TypeScript Specialist",
    "Portfolio",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${playwrite.variable} ${mona_sans.variable} font-sans antialiased selection:bg-[#ffde00] selection:text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
