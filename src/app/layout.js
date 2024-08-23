export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>3D Animation with Three.js</title>
        <meta name="description" content="3D Animation with Three.js and Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
