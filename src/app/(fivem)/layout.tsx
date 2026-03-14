import type { Metadata } from "next";
import "../(main)/globals.css";

export const metadata: Metadata = {
  title: "CERBERUS OS // GP-TWO",
  description: "Cerberus Operating System - FiveM CEF",
};

export default function FiveMLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: "'Share Tech Mono', 'Courier New', 'Lucida Console', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
