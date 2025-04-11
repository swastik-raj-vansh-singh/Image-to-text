import { Providers } from './providers';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image to Text Converter',
  description: 'Convert images to text using OCR technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 