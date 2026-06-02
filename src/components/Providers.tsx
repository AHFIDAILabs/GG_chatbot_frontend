'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider }  from '../context/AuthContext';
import { ChatProvider }  from '../context/ChatContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
