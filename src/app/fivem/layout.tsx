import type { Metadata } from "next";

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
      <body style={{ margin: 0, background: "#0a0a0c", color: "#d4d4d8", fontFamily: "monospace" }}>
        {children}
      </body>
    </html>
  );
}
