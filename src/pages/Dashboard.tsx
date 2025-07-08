
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { unifiedTransactionStore } from '@/store/unifiedTransactionStore';
import { Transaction } from '@/types/transaction';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
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

  // Remove migration logic - unified store handles this automatically

  // Update proportions when they change
  useEffect(() => {
    const loadProportions = async () => {
      setProportions(getProportionSettings());
    };

    loadProportions();

    const handleStorageChange = () => {
      setProportions(getProportionSettings());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add debug info to verify correct data is being used
  const calculations = calculateExpenses(transactions, proportions);
  
  console.log(`[Dashboard] Calculation input: ${transactions.length} transactions`);
  console.log(`[Dashboard] Person1 should pay: ${calculations.person1ShouldPay}, actually paid: ${calculations.person1ActuallyPaid}`);
  console.log(`[Dashboard] Final settlement: ${calculations.finalSettlementAmount} from ${calculations.settlementDirection}`);
  
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
