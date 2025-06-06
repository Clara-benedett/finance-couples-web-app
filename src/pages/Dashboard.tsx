
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { transactionStore } from '@/store/transactionStore';
import { calculateExpenses, getProportionSettings, ProportionSettings } from '@/utils/calculationEngine';
import ProportionSettingsComponent from '@/components/ProportionSettings';
import DebugCalculation from '@/components/DebugCalculation';
import TestScenarios from '@/components/TestScenarios';
import { useDebugMode } from '@/hooks/useDebugMode';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SettlementHero from '@/components/dashboard/SettlementHero';
import OverviewCards from '@/components/dashboard/OverviewCards';
import CalculationDetails from '@/components/dashboard/CalculationDetails';
import ActionItems from '@/components/dashboard/ActionItems';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState(transactionStore.getTransactions());
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
  const [showProportionSettings, setShowProportionSettings] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  useEffect(() => {
    const unsubscribe = transactionStore.subscribe(() => {
      setTransactions(transactionStore.getTransactions());
    });
    return unsubscribe;
  }, []);

  // Handle settings from URL parameters
  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      setShowProportionSettings(true);
      setSearchParams({}); // Clear the parameter
    }
  }, [searchParams, setSearchParams]);

  // Listen for settings event from header
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowProportionSettings(true);
    };

    window.addEventListener('openSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
  }, []);

  const calculations = calculateExpenses(transactions, proportions);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleProportionUpdate = (newProportions: ProportionSettings) => {
    setProportions(newProportions);
  };

  if (showProportionSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Settings</h1>
          <Button variant="outline" onClick={() => setShowProportionSettings(false)}>
            Back to Dashboard
          </Button>
        </div>
        <ProportionSettingsComponent
          proportions={proportions}
          onUpdate={handleProportionUpdate}
          onClose={() => setShowProportionSettings(false)}
        />
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
        onSettingsClick={() => setShowProportionSettings(true)}
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
