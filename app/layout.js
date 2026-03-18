import "./globals.css";

export const metadata = {
  title: 'Gaibandha Blood Bank',
  description: 'Request.Donate.Save Lives',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8334A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-gray-100 flex justify-center min-h-screen">
        <div className="w-full max-w-[480px] min-h-screen bg-gray-50 relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
