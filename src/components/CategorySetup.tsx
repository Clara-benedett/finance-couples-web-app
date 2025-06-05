
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Users, User, Share } from "lucide-react";

interface CategoryNames {
  person1: string;
  person2: string;
  shared: string;
}

interface CategorySetupProps {
  onComplete: (names: CategoryNames) => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const STORAGE_KEY = 'categoryNames';

const CategorySetup = ({ onComplete, isEditing = false, onCancel }: CategorySetupProps) => {
  const [names, setNames] = useState<CategoryNames>({
    person1: 'Person A',
    person2: 'Person B',
    shared: 'Shared'
  });

  useEffect(() => {
    // Load saved names from localStorage
    const savedNames = localStorage.getItem(STORAGE_KEY);
    if (savedNames) {
      try {
        setNames(JSON.parse(savedNames));
      } catch (error) {
        console.error('Error loading category names:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    onComplete(names);
  };

  const handleInputChange = (field: keyof CategoryNames, value: string) => {
    setNames(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Setup Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Define your expense categories. These names will be used throughout the categorization interface.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="person1" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name
            </Label>
            <Input
              id="person1"
              value={names.person1}
              onChange={(e) => handleInputChange('person1', e.target.value)}
              placeholder="e.g., John, Sarah"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="person2" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Partner's Name
            </Label>
            <Input
              id="person2"
              value={names.person2}
              onChange={(e) => handleInputChange('person2', e.target.value)}
              placeholder="e.g., Jane, Mike"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shared" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Shared Expenses Name
            </Label>
            <Input
              id="shared"
              value={names.shared}
              onChange={(e) => handleInputChange('shared', e.target.value)}
              placeholder="e.g., Joint, Together"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          {isEditing && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!names.person1.trim() || !names.person2.trim() || !names.shared.trim()}
          >
            {isEditing ? 'Save Changes' : 'Save & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySetup;
