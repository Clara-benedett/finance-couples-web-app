import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

const ConnectionStatus = () => {
  const { authError, retryAuth, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if everything is working fine
  if (!authError && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {!isOnline && (
        <Alert className="mb-2 border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You're offline. Your data is safe but you'll need an internet connection to sync changes.
          </AlertDescription>
        </Alert>
      )}

      {authError && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 flex items-center justify-between">
            <span className="mr-2">{authError}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={retryAuth}
              disabled={loading}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Trying...' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionStatus;