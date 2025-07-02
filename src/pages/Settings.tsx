import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, CreditCard, Users, Edit3, Save, X, User, Share, Trash2 } from "lucide-react";
import CardRulesManager from "@/components/CardRulesManager";
import { getCategoryNames, setCategoryNames, CategoryNames } from "@/utils/categoryNames";
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface ProportionSettings {
  person1Percentage: number;
  person2Percentage: number;
}

const Settings = () => {
  const [proportions, setProportions] = useState<ProportionSettings>({ person1Percentage: 50, person2Percentage: 50 });
  const [categoryNames, setCategoryNamesState] = useState<CategoryNames>({ person1: 'Person A', person2: 'Person B', shared: 'Shared' });
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [editedNames, setEditedNames] = useState<CategoryNames>(categoryNames);
  const [isClearing, setIsClearing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          // Load proportion settings
          const settings = await supabaseTransactionStore.getProportionSettings();
          setProportions({
            person1Percentage: settings.person1_percentage,
            person2Percentage: settings.person2_percentage,
          });

          // Load category names from database
          const categoryData = await supabaseTransactionStore.getCategoryNames();
          const dbCategoryNames = {
            person1: categoryData.person1_name || 'Person A',
            person2: categoryData.person2_name || 'Person B',
            shared: 'Shared'
          };
          setCategoryNamesState(dbCategoryNames);
          setEditedNames(dbCategoryNames);
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const localNames = getCategoryNames();
        setCategoryNamesState(localNames);
        setEditedNames(localNames);
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  const handleSliderChange = (value: number[]) => {
    const person1Percentage = value[0];
    const person2Percentage = 100 - person1Percentage;
    setProportions({
      person1Percentage,
      person2Percentage,
    });
  };

  const handleInputChange = (field: keyof ProportionSettings, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherValue = 100 - numValue;
    
    if (field === 'person1Percentage') {
      setProportions({
        person1Percentage: numValue,
        person2Percentage: otherValue,
      });
    } else {
      setProportions({
        person1Percentage: otherValue,
        person2Percentage: numValue,
      });
    }
  };

  const handleSaveProportions = async () => {
    try {
      const success = await supabaseTransactionStore.saveProportionSettings({
        person1_percentage: proportions.person1Percentage,
        person2_percentage: proportions.person2Percentage,
      });

      if (success) {
        toast({
          title: "Settings saved",
          description: "Your expense split settings have been updated successfully",
        });
      } else {
        toast({
          title: "Error saving settings",
          description: "There was an error saving your settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings",
        variant: "destructive",
      });
    }
  };

  const handleEditNames = () => {
    setEditedNames(categoryNames);
    setIsEditingNames(true);
  };

  const handleCancelEditNames = () => {
    setEditedNames(categoryNames);
    setIsEditingNames(false);
  };

  const handleSaveNames = async () => {
    if (!editedNames.person1.trim() || !editedNames.person2.trim() || !editedNames.shared.trim()) {
      toast({
        title: "Validation Error",
        description: "All category names must be filled in",
        variant: "destructive",
      });
      return;
    }

    // Save to database if authenticated
    if (user) {
      const success = await supabaseTransactionStore.saveCategoryNames(
        editedNames.person1,
        editedNames.person2
      );
      
      if (!success) {
        toast({
          title: "Error saving names",
          description: "There was an error saving your category names",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      setCategoryNames(editedNames);
    }

    setCategoryNamesState(editedNames);
    setIsEditingNames(false);
    
    toast({
      title: "Category names updated",
      description: "Your expense category names have been updated successfully",
    });
  };

  const handleNameInputChange = (field: keyof CategoryNames, value: string) => {
    setEditedNames(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearAllData = () => {
    setIsClearing(true);
    try {
      supabaseTransactionStore.clearAllData();
      toast({
        title: "All data cleared",
        description: "Your app data has been reset. Refresh the page to see changes.",
      });
    } catch (error) {
      toast({
        title: "Error clearing data",
        description: "There was an error clearing your data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const storageInfo = supabaseTransactionStore.getStorageInfo();

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your expense tracking preferences and split settings
        </p>
      </div>

      {/* Expense Split Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Expense Split Settings
          </CardTitle>
          <CardDescription>
            Adjust how shared expenses are split between you and your partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slider Control */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Split Percentage</Label>
            <div className="px-2">
              <Slider
                value={[proportions.person1Percentage]}
                onValueChange={handleSliderChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{categoryNames.person1}: {proportions.person1Percentage}%</span>
              <span>{categoryNames.person2}: {proportions.person2Percentage}%</span>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="person1Percentage" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {categoryNames.person1} %
              </Label>
              <Input
                id="person1Percentage"
                type="number"
                min="0"
                max="100"
                value={proportions.person1Percentage}
                onChange={(e) => handleInputChange('person1Percentage', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="person2Percentage" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {categoryNames.person2} %
              </Label>
              <Input
                id="person2Percentage"
                type="number"
                min="0"
                max="100"
                value={proportions.person2Percentage}
                onChange={(e) => handleInputChange('person2Percentage', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveProportions}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Split Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Names Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Category Names</CardTitle>
              <CardDescription>
                {isEditingNames ? "Edit your expense category names" : "The expense categories you're currently using"}
              </CardDescription>
            </div>
            {!isEditingNames && (
              <Button variant="outline" size="sm" onClick={handleEditNames}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Names
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNames ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="person1Name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Name
                  </Label>
                  <Input
                    id="person1Name"
                    value={editedNames.person1}
                    onChange={(e) => handleNameInputChange('person1', e.target.value)}
                    placeholder="e.g., John, Sarah"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="person2Name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Partner's Name
                  </Label>
                  <Input
                    id="person2Name"
                    value={editedNames.person2}
                    onChange={(e) => handleNameInputChange('person2', e.target.value)}
                    placeholder="e.g., Jane, Mike"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sharedName" className="flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    Shared Expenses Name
                  </Label>
                  <Input
                    id="sharedName"
                    value={editedNames.shared}
                    onChange={(e) => handleNameInputChange('shared', e.target.value)}
                    placeholder="e.g., Joint, Together"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelEditNames}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNames}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!editedNames.person1.trim() || !editedNames.person2.trim() || !editedNames.shared.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Names
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">{categoryNames.person1}</h4>
                <p className="text-sm text-blue-700">Individual expenses</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">{categoryNames.person2}</h4>
                <p className="text-sm text-green-700">Individual expenses</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">{categoryNames.shared}</h4>
                <p className="text-sm text-purple-700">Shared expenses</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Rules Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card Classification Rules
          </CardTitle>
          <CardDescription>
            Manage automatic categorization rules for your cards and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardRulesManager />
        </CardContent>
      </Card>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your stored data and reset the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Current Storage</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Transactions: {storageInfo.transactionCount}</p>
              <p>Storage size: {storageInfo.storageSize}</p>
              <p>Version: {storageInfo.version}</p>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Clear All Data</h4>
            <p className="text-sm text-red-700 mb-3">
              This will permanently delete all your transactions, settings, and rules. This action cannot be undone.
            </p>
            <Button 
              variant="destructive"
              onClick={handleClearAllData}
              disabled={isClearing}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
