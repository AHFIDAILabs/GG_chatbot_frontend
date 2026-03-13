import type { Metadata }  from 'next';
import { DM_Sans }        from 'next/font/google';
import './globals.css';
import { AuthProvider }   from '../context/AuthContext';
import { ChatProvider }   from '../context/ChatContext';

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'Amara – GGCL Green Girls Academy',
  description: 'Your safe space to ask anything about periods, digital skills, the environment and life skills.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body style={{ background: '#09160d', color: '#d1fae5', fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}