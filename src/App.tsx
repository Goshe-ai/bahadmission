import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from '@/pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Dashboard darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { fontFamily: 'Heebo, sans-serif', direction: 'rtl' },
            success: { duration: 2500 },
            error: { duration: 4000 },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
