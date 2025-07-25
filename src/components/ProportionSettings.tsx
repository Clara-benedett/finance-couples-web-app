
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Users } from "lucide-react";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { ProportionSettings } from '@/utils/calculationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { isSupabaseConfigured } from '@/lib/supabase';

interface ProportionSettingsProps {
  proportions: ProportionSettings;
  onUpdate: (proportions: ProportionSettings) => void;
  onClose?: () => void;
}

const ProportionSettingsComponent = ({ proportions, onUpdate, onClose }: ProportionSettingsProps) => {
  const { user } = useAuth();
  const [localProportions, setLocalProportions] = useState(proportions);
  const [saving, setSaving] = useState(false);
  const { categoryNames } = useCategoryNames();

  const handleSliderChange = (value: number[]) => {
    const person1Percentage = value[0];
    const person2Percentage = 100 - person1Percentage;
    setLocalProportions({
      person1Percentage,
      person2Percentage,
    });
  };

  const handleInputChange = (field: keyof ProportionSettings, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherValue = 100 - numValue;
    
    if (field === 'person1Percentage') {
      setLocalProportions({
        person1Percentage: numValue,
        person2Percentage: otherValue,
      });
    } else {
      setLocalProportions({
        person1Percentage: otherValue,
        person2Percentage: numValue,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isSupabaseConfigured && user) {
        console.log('[ProportionSettings] Saving to Supabase:', localProportions);
        const success = await supabaseTransactionStore.saveProportionSettings({
          person1_percentage: localProportions.person1Percentage,
          person2_percentage: localProportions.person2Percentage,
        });
        
        if (success) {
          console.log('[ProportionSettings] Successfully saved to Supabase');
          
          // Trigger multiple events to ensure Dashboard gets notified
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'proportionSettings',
            newValue: JSON.stringify(localProportions)
          }));
          
          // Also trigger a custom event for more reliable communication
          window.dispatchEvent(new CustomEvent('proportionSettingsChanged', {
            detail: localProportions
          }));
          
          // Force a page refresh event to ensure Dashboard reloads
          window.dispatchEvent(new Event('focus'));
          
          onUpdate(localProportions);
          console.log('[ProportionSettings] All events dispatched for:', localProportions);
        } else {
          console.error('[ProportionSettings] Failed to save to Supabase');
          throw new Error('Failed to save settings');
        }
      } else {
        console.log('[ProportionSettings] No Supabase config, using localStorage fallback');
        throw new Error('Supabase not configured');
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('[ProportionSettings] Error saving:', error);
      // You might want to show a toast notification here
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Expense Split Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Adjust how shared expenses are split between you and your partner.
        </p>

        {/* Slider Control */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Split Percentage</Label>
          <div className="px-2">
            <Slider
              value={[localProportions.person1Percentage]}
              onValueChange={handleSliderChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
              disabled={saving}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{categoryNames.person1}: {localProportions.person1Percentage}%</span>
            <span>{categoryNames.person2}: {localProportions.person2Percentage}%</span>
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
              value={localProportions.person1Percentage}
              onChange={(e) => handleInputChange('person1Percentage', e.target.value)}
              disabled={saving}
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
              value={localProportions.person2Percentage}
              onChange={(e) => handleInputChange('person2Percentage', e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProportionSettingsComponent;
