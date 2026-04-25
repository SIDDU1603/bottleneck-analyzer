import './globals.css';
import { BuildProvider } from '@/components/BuildContext';
import Header from '@/components/Header';

export const metadata = {
  title: 'BottleneckIQ — Smart Hardware Bottleneck Analyzer',
  description: 'AI-powered PC hardware bottleneck analyzer. Select components, detect performance imbalances, and get smart upgrade suggestions powered by Gemini AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BuildProvider>
          <Header />
          <main>{children}</main>
        </BuildProvider>
      </body>
    </html>
  );
}
