import './globals.css';
import SiteChrome from './SiteChrome';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}