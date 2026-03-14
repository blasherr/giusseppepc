import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CERBERUS OS // GP-TWO",
  description: "Cerberus Operating System - Ultra Futuristic Simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(msg, src, line, col, err) {
                var d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#1a0000;color:#ff4444;padding:12px;font-family:monospace;font-size:11px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:2px solid #ff4444';
                d.textContent = '[CEF ERROR] ' + msg + '\\nFile: ' + src + '\\nLine: ' + line + ':' + col + '\\n' + (err && err.stack ? err.stack : '');
                document.body.appendChild(d);
              };
              window.addEventListener('unhandledrejection', function(e) {
                var d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#1a0000;color:#ff4444;padding:12px;font-family:monospace;font-size:11px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:2px solid #ff4444';
                d.textContent = '[CEF PROMISE ERROR] ' + (e.reason ? (e.reason.message || e.reason) : 'unknown');
                document.body.appendChild(d);
              });
            `,
          }}
        />
      </head>
      <body className={`${shareTechMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
