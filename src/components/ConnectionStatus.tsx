
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, AlertCircle, RefreshCw, X } from 'lucide-react';

const ConnectionStatus = () => {
  const { authError, retryAuth, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[CONNECTION] Online detected');
      setIsOnline(true);
      setIsDismissed(false); // Reset dismissal when coming back online
    };
    
    const handleOffline = () => {
      console.log('[CONNECTION] Offline detected');
      setIsOnline(false);
      setIsDismissed(false); // Show alert when going offline
    };

    // Add more robust online/offline detection
    const checkConnection = async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const actuallyOnline = response.ok;
        console.log('[CONNECTION] Connection check:', actuallyOnline);
        setIsOnline(actuallyOnline);
      } catch (error) {
        console.log('[CONNECTION] Connection check failed:', error);
        setIsOnline(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status on mount and periodically
    checkConnection();
    const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Don't show anything if everything is working fine or if dismissed
  if ((!authError && isOnline) || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {!isOnline && (
        <Alert className="mb-2 border-red-200 bg-red-50 relative">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 pr-8">
            You're offline. Your data is safe but you'll need an internet connection to sync changes.
          </AlertDescription>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="absolute top-1 right-1 h-6 w-6 p-0 text-red-600 hover:text-red-800"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}

      {authError && (
        <Alert className="border-amber-200 bg-amber-50 relative">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 flex items-center justify-between pr-8">
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="absolute top-1 right-1 h-6 w-6 p-0 text-amber-600 hover:text-amber-800"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionStatus;
