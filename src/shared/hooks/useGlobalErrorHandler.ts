import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function useGlobalErrorHandler() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      // eslint-disable-next-line no-console
      console.error(event.error ?? event.message);
      toast.error('Something went wrong');
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
      // eslint-disable-next-line no-console
      console.error(event.reason);
      toast.error(reason || 'Unexpected error');
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
}
