
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

  // Load proportions from Supabase and listen for changes
  useEffect(() => {
    const loadProportions = async () => {
      if (user) {
        try {
          setProportionsLoading(true);
          const settings = await supabaseTransactionStore.getProportionSettings();
          console.log('[Dashboard] Loaded proportions from Supabase:', settings);
          
          const newProportions = {
            person1Percentage: settings.person1_percentage,
            person2Percentage: settings.person2_percentage,
          };
          
          setProportions(newProportions);
          console.log('[Dashboard] Updated proportions state:', newProportions);
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

    // Listen for custom storage events when proportions change
    const handleProportionChange = (event: StorageEvent) => {
      if (event.key === 'proportionSettings') {
        console.log('[Dashboard] Proportion settings changed, reloading...');
        loadProportions();
      }
    };

    // Listen for focus events to reload proportions when user comes back to dashboard
    const handleFocus = () => {
      console.log('[Dashboard] Window focused, reloading proportions...');
      loadProportions();
    };

    window.addEventListener('storage', handleProportionChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleProportionChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Force refresh proportions when navigating back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('[Dashboard] Page became visible, reloading proportions...');
        const loadProportions = async () => {
          try {
            const settings = await supabaseTransactionStore.getProportionSettings();
            const newProportions = {
              person1Percentage: settings.person1_percentage,
              person2Percentage: settings.person2_percentage,
            };
            setProportions(newProportions);
            console.log('[Dashboard] Refreshed proportions on visibility change:', newProportions);
          } catch (error) {
            console.error('[Dashboard] Error refreshing proportions:', error);
          }
        };
        loadProportions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Add debug info to verify correct data is being used
  // Only include unpaid transactions in calculations
  const unpaidTransactions = transactions.filter(t => !t.isPaid);
  const calculations = calculateExpenses(unpaidTransactions, proportions);
  
  console.log(`[Dashboard] Calculation input: ${unpaidTransactions.length} unpaid transactions (${transactions.length} total)`);
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
