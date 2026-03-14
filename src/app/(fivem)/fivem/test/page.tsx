export default function TestPage() {
  return (
    <html>
      <head>
        <title>CEF TEST</title>
      </head>
      <body
        style={{
          margin: 0,
          background: "#111",
          color: "#0f0",
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: 20,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, marginBottom: 16 }}>CERBERUS OS - TEST</p>
          <p style={{ color: "#0f0" }}>Si tu vois ce texte, le CEF charge la page.</p>
          <p style={{ color: "#ff0", marginTop: 12, fontSize: 14 }}>
            URL: /fivem/test
          </p>
        </div>
      </body>
    </html>
  );
}
