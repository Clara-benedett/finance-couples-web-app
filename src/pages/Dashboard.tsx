
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { transactionStore } from '@/store/transactionStore';
import { calculateExpenses, getProportionSettings, ProportionSettings } from '@/utils/calculationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import DebugCalculation from '@/components/DebugCalculation';
import TestScenarios from '@/components/TestScenarios';
import { useDebugMode } from '@/hooks/useDebugMode';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SettlementHero from '@/components/dashboard/SettlementHero';
import OverviewCards from '@/components/dashboard/OverviewCards';
import CalculationDetails from '@/components/dashboard/CalculationDetails';
import ActionItems from '@/components/dashboard/ActionItems';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(
    isSupabaseConfigured && user 
      ? supabaseTransactionStore.getTransactions()
      : transactionStore.getTransactions()
  );
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'checking' | 'migrating' | 'complete' | 'error'>('checking');
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  const activeStore = isSupabaseConfigured && user ? supabaseTransactionStore : transactionStore;

  useEffect(() => {
    const unsubscribe = activeStore.subscribe(() => {
      setTransactions(activeStore.getTransactions());
    });
    return unsubscribe;
  }, [activeStore]);

  // Handle data migration when user signs in
  useEffect(() => {
    const handleMigration = async () => {
      if (isSupabaseConfigured && user && migrationStatus === 'checking') {
        setMigrationStatus('migrating');
        try {
          const success = await supabaseTransactionStore.migrateLocalStorageToDatabase();
          setMigrationStatus(success ? 'complete' : 'error');
          
          if (success) {
            // Update transactions from the migrated data
            setTransactions(supabaseTransactionStore.getTransactions());
          }
        } catch (error) {
          console.error('Migration failed:', error);
          setMigrationStatus('error');
        }
      } else if (!isSupabaseConfigured || !user) {
        setMigrationStatus('complete');
      }
    };

    handleMigration();
  }, [user, migrationStatus]);

  // Update proportions when they change
  useEffect(() => {
    const loadProportions = async () => {
      if (isSupabaseConfigured && user) {
        const dbProportions = await supabaseTransactionStore.getProportionSettings();
        setProportions({
          person1Percentage: dbProportions.person1_percentage,
          person2Percentage: dbProportions.person2_percentage,
        });
      } else {
        setProportions(getProportionSettings());
      }
    };

    loadProportions();

    const handleStorageChange = () => {
      if (!isSupabaseConfigured || !user) {
        setProportions(getProportionSettings());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Add a listener for proportion changes when user navigates back from settings
  useEffect(() => {
    const handleProportionRefresh = async () => {
      if (isSupabaseConfigured && user) {
        const dbProportions = await supabaseTransactionStore.getProportionSettings();
        setProportions({
          person1Percentage: dbProportions.person1_percentage,
          person2Percentage: dbProportions.person2_percentage,
        });
      }
    };

    // Listen for focus events to refresh proportions when user comes back from settings
    window.addEventListener('focus', handleProportionRefresh);
    return () => window.removeEventListener('focus', handleProportionRefresh);
  }, [user]);

  const calculations = calculateExpenses(transactions, proportions);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Show migration status if in progress
  if (migrationStatus === 'migrating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Migrating your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <DashboardHeader
        currentMonth={currentMonth}
        isDebugMode={isDebugMode}
        toggleDebugMode={toggleDebugMode}
        onUploadClick={() => navigate("/upload")}
        onSettingsClick={() => navigate("/settings")}
      />

      {/* Debug Mode Sections */}
      {isDebugMode && (
        <div className="space-y-6">
          <DebugCalculation calculations={calculations} transactions={transactions} />
          <TestScenarios />
        </div>
      )}

      {/* HERO SECTION - Final Settlement */}
      <SettlementHero
        calculations={calculations}
        proportions={proportions}
        currentMonth={currentMonth}
      />

      {/* QUICK OVERVIEW CARDS */}
      <OverviewCards calculations={calculations} />

      {/* PROGRESSIVE DISCLOSURE - Calculation Details */}
      <CalculationDetails
        calculations={calculations}
        showCalculationDetails={showCalculationDetails}
        onToggle={setShowCalculationDetails}
      />

      {/* ACTION ITEMS */}
      <ActionItems
        calculations={calculations}
        onCategorizeClick={() => navigate("/categorize")}
        onUploadClick={() => navigate("/upload")}
      />
    </div>
  );
};

export default Dashboard;
