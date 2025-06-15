
import { Check, Plus } from "lucide-react";
import { CardClassificationRule } from "@/utils/cardClassificationRules";
import { getCategoryNames } from "@/utils/categoryNames";

interface SmartCardStatusProps {
  value: string;
  existingRule: CardClassificationRule | null;
}

const SmartCardStatus = ({ value, existingRule }: SmartCardStatusProps) => {
  const categoryNames = getCategoryNames();

  const getCategoryDisplay = (classification: string) => {
    switch (classification) {
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'shared': return categoryNames.shared;
      default: return classification;
    }
  };

  if (!value) {
    return null;
  }

  return (
    <div className="text-xs">
      {existingRule ? (
        <span className="text-green-600 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Using existing rule: {getCategoryDisplay(existingRule.classification)}
        </span>
      ) : (
        <span className="text-blue-600 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          New card rule will be created
        </span>
      )}
    </div>
  );
};

export default SmartCardStatus;
