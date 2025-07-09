
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { unifiedTransactionStore } from '@/store/unifiedTransactionStore';
import { Transaction } from '@/types/transaction';
import { calculateExpenses, ProportionSettings } from '@/utils/calculationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [proportions, setProportions] = useState<ProportionSettings>({ person1Percentage: 50, person2Percentage: 50 });
  const [proportionsLoading, setProportionsLoading] = useState(true);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  useEffect(() => {
    // Force refresh transactions when component mounts
    const refreshTransactions = async () => {
      const latestTransactions = await unifiedTransactionStore.getTransactions();
      console.log(`[Dashboard] Using ${latestTransactions.length} transactions for calculations`);
      setTransactions(latestTransactions);
    };

    refreshTransactions();
    
    // Subscribe to store changes so dashboard updates when transactions change
    const unsubscribe = unifiedTransactionStore.subscribe(refreshTransactions);
    
    return unsubscribe;
  }, []);

  // Load proportions from Supabase - this is the key fix
  useEffect(() => {
    const loadProportions = async () => {
      if (user) {
        try {
          setProportionsLoading(true);
          const settings = await supabaseTransactionStore.getProportionSettings();
          console.log('[Dashboard] Loaded proportions from Supabase:', settings);
          
          setProportions({
            person1Percentage: settings.person1_percentage,
            person2Percentage: settings.person2_percentage,
          });
        } catch (error) {
          console.error('[Dashboard] Error loading proportions:', error);
          // Fallback to default only if there's an error
          setProportions({ person1Percentage: 50, person2Percentage: 50 });
        } finally {
          setProportionsLoading(false);
        }
      } else {
        // For non-authenticated users, use defaults
        setProportions({ person1Percentage: 50, person2Percentage: 50 });
        setProportionsLoading(false);
      }
    };

    loadProportions();

    // Listen for storage events to refresh proportions when they change in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token') {
        // Auth state changed, reload proportions
        loadProportions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Add debug info to verify correct data is being used
  const calculations = calculateExpenses(transactions, proportions);
  
  console.log(`[Dashboard] Calculation input: ${transactions.length} transactions`);
  console.log(`[Dashboard] Current proportions: ${proportions.person1Percentage}/${proportions.person2Percentage}`);
  console.log(`[Dashboard] Person1 should pay: ${calculations.person1ShouldPay}, actually paid: ${calculations.person1ActuallyPaid}`);
  console.log(`[Dashboard] Final settlement: ${calculations.finalSettlementAmount} from ${calculations.settlementDirection}`);
  
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Show loading state while proportions are being loaded
  if (proportionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
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
        onUploadClick={() => navigate("/app/upload")}
        onSettingsClick={() => navigate("/app/settings")}
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
        onCategorizeClick={() => navigate("/app/categorize")}
        onUploadClick={() => navigate("/app/upload")}
      />
    </div>
  );
};

export default Dashboard;
