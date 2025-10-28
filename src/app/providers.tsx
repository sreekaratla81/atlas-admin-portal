import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGlobalErrorHandler } from '@/shared/hooks/useGlobalErrorHandler';
import { Spinner } from '@/shared/ui/Spinner';
import { Toaster } from '@/shared/ui/Toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders({ children }: React.PropsWithChildren) {
  useGlobalErrorHandler();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>{children}</Suspense>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
