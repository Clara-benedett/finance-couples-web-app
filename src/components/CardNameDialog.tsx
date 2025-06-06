
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard } from "lucide-react";
import { getCategoryNames } from "@/utils/categoryNames";

interface CardInfo {
  name: string;
  paidBy: 'person1' | 'person2';
}

interface CardNameDialogProps {
  isOpen: boolean;
  onConfirm: (cardInfos: CardInfo[]) => void;
  onCancel: () => void;
  fileNames: string[];
}

const CardNameDialog = ({ isOpen, onConfirm, onCancel, fileNames }: CardNameDialogProps) => {
  const [cardInfos, setCardInfos] = useState<CardInfo[]>([]);
  const categoryNames = getCategoryNames();

  // Initialize card infos array when dialog opens
  useState(() => {
    if (isOpen && fileNames.length > 0) {
      setCardInfos(new Array(fileNames.length).fill(null).map(() => ({
        name: '',
        paidBy: 'person1' as const
      })));
    }
  });

  const handleCardNameChange = (index: number, value: string) => {
    const newCardInfos = [...cardInfos];
    newCardInfos[index] = { ...newCardInfos[index], name: value };
    setCardInfos(newCardInfos);
  };

  const handlePaidByChange = (index: number, value: 'person1' | 'person2') => {
    const newCardInfos = [...cardInfos];
    newCardInfos[index] = { ...newCardInfos[index], paidBy: value };
    setCardInfos(newCardInfos);
  };

  const handleConfirm = () => {
    const trimmedInfos = cardInfos.map(info => ({
      name: info.name.trim(),
      paidBy: info.paidBy
    }));
    
    if (trimmedInfos.every(info => info.name.length > 0)) {
      onConfirm(trimmedInfos);
      setCardInfos([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus next input or submit if it's the last one
      if (index < fileNames.length - 1) {
        const nextInput = document.getElementById(`cardName-${index + 1}`);
        nextInput?.focus();
      } else if (cardInfos.every(info => info.name.trim().length > 0)) {
        handleConfirm();
      }
    }
  };

  const allFieldsFilled = cardInfos.length === fileNames.length && 
    cardInfos.every(info => info.name.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card/Account Information ({fileNames.length} files)
          </DialogTitle>
          <DialogDescription>
            Please provide the card/account name and who pays the bill for each file you're uploading.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {fileNames.map((fileName, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600">
                <strong>File {index + 1}:</strong> {fileName}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`cardName-${index}`}>Card/Account Name</Label>
                <Input
                  id={`cardName-${index}`}
                  placeholder="e.g., Chase Sapphire, AMEX Gold, BILT Card"
                  value={cardInfos[index]?.name || ''}
                  onChange={(e) => handleCardNameChange(index, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              </div>

              <div className="space-y-3">
                <Label>Bill paid by <span className="text-sm text-gray-500">(who pays the bill of this card?)</span></Label>
                <RadioGroup
                  value={cardInfos[index]?.paidBy || 'person1'}
                  onValueChange={(value: 'person1' | 'person2') => handlePaidByChange(index, value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="person1" id={`person1-${index}`} />
                    <Label htmlFor={`person1-${index}`} className="font-normal">
                      {categoryNames.person1}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="person2" id={`person2-${index}`} />
                    <Label htmlFor={`person2-${index}`} className="font-normal">
                      {categoryNames.person2}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!allFieldsFilled}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Process Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardNameDialog;
