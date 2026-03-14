import type { Metadata } from "next";
import "../globals.css";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
      <body
        className="antialiased"
        style={{ fontFamily: "'Share Tech Mono', 'Courier New', 'Lucida Console', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
