
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCategoryNames } from "@/hooks/useCategoryNames";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface CategoryButtonsProps {
  currentCategory: string;
  onCategoryClick: (category: CategoryType) => void;
  isForBulk?: boolean;
  isDisabled?: boolean;
}

const CategoryButtons = ({ 
  currentCategory, 
  onCategoryClick, 
  isForBulk = false, 
  isDisabled = false 
}: CategoryButtonsProps) => {
  const { categoryNames, loading } = useCategoryNames();

  const getCategoryButtonClass = (category: CategoryType, currentCategory: string) => {
    const baseClass = "relative overflow-hidden transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 min-w-[100px] touch-manipulation rounded-full";
    const isSelected = currentCategory === category;
    const disabledClass = isDisabled ? "cursor-not-allowed opacity-60" : "";
    
    if (isSelected) {
      switch (category) {
        case 'person1':
          return `${baseClass} ${disabledClass} bg-blue-600 text-white border-2 border-blue-600 shadow-blue-200 shadow-lg hover:bg-blue-700 hover:shadow-blue-300`;
        case 'person2':
          return `${baseClass} ${disabledClass} bg-green-600 text-white border-2 border-green-600 shadow-green-200 shadow-lg hover:bg-green-700 hover:shadow-green-300`;
        case 'shared':
          return `${baseClass} ${disabledClass} bg-purple-600 text-white border-2 border-purple-600 shadow-purple-200 shadow-lg hover:bg-purple-700 hover:shadow-purple-300`;
        case 'UNCLASSIFIED':
          return `${baseClass} ${disabledClass} bg-gray-600 text-white border-2 border-gray-600 shadow-gray-200 shadow-lg hover:bg-gray-700 hover:shadow-gray-300`;
      }
    } else {
      switch (category) {
        case 'person1':
          return `${baseClass} ${disabledClass} bg-transparent text-blue-600 border-2 border-blue-300 opacity-50 hover:opacity-100 hover:bg-blue-50 hover:border-blue-500 hover:shadow-blue-200`;
        case 'person2':
          return `${baseClass} ${disabledClass} bg-transparent text-green-600 border-2 border-green-300 opacity-50 hover:opacity-100 hover:bg-green-50 hover:border-green-500 hover:shadow-green-200`;
        case 'shared':
          return `${baseClass} ${disabledClass} bg-transparent text-purple-600 border-2 border-purple-300 opacity-50 hover:opacity-100 hover:bg-purple-50 hover:border-purple-500 hover:shadow-purple-200`;
        case 'UNCLASSIFIED':
          return `${baseClass} ${disabledClass} bg-transparent text-gray-600 border-2 border-gray-300 opacity-50 hover:opacity-100 hover:bg-gray-50 hover:border-gray-500 hover:shadow-gray-200`;
      }
    }
    
    return baseClass;
  };

  const renderCategoryButton = (category: CategoryType) => {
    const isSelected = currentCategory === category;
    const buttonClass = getCategoryButtonClass(category, currentCategory);
    
    let label = '';
    if (loading) {
      label = category === 'UNCLASSIFIED' ? 'Unclassified' : 'Loading...';
    } else {
      switch (category) {
        case 'person1':
          label = categoryNames.person1;
          break;
        case 'person2':
          label = categoryNames.person2;
          break;
        case 'shared':
          label = categoryNames.shared;
          break;
        case 'UNCLASSIFIED':
          label = 'Unclassified';
          break;
      }
    }

    return (
      <button
        key={category}
        onClick={() => !isDisabled && onCategoryClick(category)}
        className={buttonClass}
        style={{ minHeight: '40px' }}
        disabled={isDisabled}
      >
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          {isSelected && <Check className="w-4 h-4" />}
          <span className="font-medium">{label}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex gap-2">
      {renderCategoryButton('person1')}
      {renderCategoryButton('person2')}
      {renderCategoryButton('shared')}
      {renderCategoryButton('UNCLASSIFIED')}
    </div>
  );
};

export default CategoryButtons;
