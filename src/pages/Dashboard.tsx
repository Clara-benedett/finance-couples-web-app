
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { transactionStore } from '@/store/transactionStore';
import { calculateExpenses, getProportionSettings, ProportionSettings } from '@/utils/calculationEngine';
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
  const [transactions, setTransactions] = useState(transactionStore.getTransactions());
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  useEffect(() => {
    const unsubscribe = transactionStore.subscribe(() => {
      setTransactions(transactionStore.getTransactions());
    });
    return unsubscribe;
  }, []);

  // Update proportions when they change in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setProportions(getProportionSettings());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculations = calculateExpenses(transactions, proportions);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
