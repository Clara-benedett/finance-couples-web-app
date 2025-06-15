
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const DataMigrationNotice = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if user has local data and is signed in
    if (isSupabaseConfigured && user) {
      const localData = localStorage.getItem('expense_tracker_transactions');
      if (localData) {
        try {
          const transactions = JSON.parse(localData);
          if (Array.isArray(transactions) && transactions.length > 0) {
            setHasLocalData(true);
            setShowNotice(true);
          }
        } catch (error) {
          // Invalid data, ignore
        }
      }
    }
  }, [user]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const success = await supabaseTransactionStore.migrateLocalStorageToDatabase();
      if (success) {
        toast({
          title: "Data migrated successfully",
          description: "Your transactions are now saved to your account",
        });
        setShowNotice(false);
      } else {
        toast({
          title: "Migration failed",
          description: "Please try again or contact support",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Migration error",
        description: "An error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setShowNotice(false);
    toast({
      title: "Migration skipped",
      description: "Your local data will remain on this device only",
    });
  };

  if (!showNotice || !hasLocalData) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📦</div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Migrate your existing data
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              We found transactions stored locally on this device. Would you like to move them to your account so they're accessible from anywhere?
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleMigrate} 
                disabled={isMigrating}
                size="sm"
              >
                {isMigrating ? 'Migrating...' : 'Yes, migrate my data'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkip}
                disabled={isMigrating}
                size="sm"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigrationNotice;
