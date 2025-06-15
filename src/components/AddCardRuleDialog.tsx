
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Share } from "lucide-react";
import { getCategoryNames } from "@/utils/categoryNames";
import SmartCardInput from "./SmartCardInput";

interface AddCardRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName: string;
  onCardNameChange: (name: string) => void;
  classification: 'person1' | 'person2' | 'shared';
  onClassificationChange: (classification: 'person1' | 'person2' | 'shared') => void;
  onAdd: () => void;
}

const AddCardRuleDialog = ({
  open,
  onOpenChange,
  cardName,
  onCardNameChange,
  classification,
  onClassificationChange,
  onAdd
}: AddCardRuleDialogProps) => {
  const categoryNames = getCategoryNames();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card Rule</DialogTitle>
          <DialogDescription>
            Create an automatic classification rule for a card or account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <SmartCardInput
            value={cardName}
            onChange={onCardNameChange}
            placeholder="Enter card or account name"
          />

          <div className="space-y-3">
            <Label>Automatically classify as:</Label>
            <RadioGroup
              value={classification}
              onValueChange={onClassificationChange}
              className="grid grid-cols-1 gap-3"
            >
              <Label htmlFor="add-person1" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                <RadioGroupItem value="person1" id="add-person1" />
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-normal text-blue-600">{categoryNames.person1}</span>
              </Label>
              <Label htmlFor="add-person2" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                <RadioGroupItem value="person2" id="add-person2" />
                <User className="w-4 h-4 text-green-600" />
                <span className="font-normal text-green-600">{categoryNames.person2}</span>
              </Label>
              <Label htmlFor="add-shared" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                <RadioGroupItem value="shared" id="add-shared" />
                <Share className="w-4 h-4 text-purple-600" />
                <span className="font-normal text-purple-600">{categoryNames.shared}</span>
              </Label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={!cardName.trim()}>
            Add Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardRuleDialog;
