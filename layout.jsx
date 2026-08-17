import { Cinzel, Cormorant_Garamond, Lora, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['500','600','700'], variable: '--font-display-raw' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500','600','700'], style: ['normal','italic'], variable: '--font-serif-raw' });
const lora = Lora({ subsets: ['latin'], weight: ['400','500','600'], style: ['normal','italic'], variable: '--font-body-raw' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-mono-raw' });

export const metadata = {
  title: 'Vedic Kundali — Birth Chart & Report',
  description: 'Generate your personalized Vedic astrology birth chart and detailed Kundali report.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${lora.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
