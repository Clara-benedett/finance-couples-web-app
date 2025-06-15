import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, User, Share, SkipForward } from "lucide-react";
import { getCategoryNames } from "@/utils/categoryNames";
import SmartCardInput from "./SmartCardInput";

interface CardInfo {
  name: string;
  paidBy: 'person1' | 'person2';
  autoClassification?: 'person1' | 'person2' | 'shared' | 'skip';
}

interface CardNameDialogProps {
  isOpen: boolean;
  onConfirm: (cardInfos: CardInfo[]) => void;
  onCancel: () => void;
  fileNames: string[];
}

const CardNameDialog = ({ isOpen, onConfirm, onCancel, fileNames }: CardNameDialogProps) => {
  const [step, setStep] = useState<'names' | 'classification'>('names');
  const [cardInfos, setCardInfos] = useState<CardInfo[]>([]);
  const categoryNames = getCategoryNames();

  // Initialize card infos array when dialog opens or fileNames change
  useEffect(() => {
    if (isOpen && fileNames.length > 0) {
      console.log('CardNameDialog: Initializing cardInfos for', fileNames.length, 'files');
      const initialCardInfos = fileNames.map(() => ({
        name: '',
        paidBy: 'person1' as const,
        autoClassification: 'skip' as const
      }));
      setCardInfos(initialCardInfos);
      setStep('names');
      console.log('CardNameDialog: Initial cardInfos set to:', initialCardInfos);
    } else if (!isOpen) {
      // Reset when dialog closes
      setCardInfos([]);
      setStep('names');
    }
  }, [isOpen, fileNames]);

  const handleCardNameChange = (index: number, value: string) => {
    console.log('CardNameDialog: handleCardNameChange called with index:', index, 'value:', value);
    console.log('CardNameDialog: current cardInfos before update:', cardInfos);
    
    setCardInfos(prevCardInfos => {
      const newCardInfos = [...prevCardInfos];
      newCardInfos[index] = { ...newCardInfos[index], name: value };
      console.log('CardNameDialog: setting new cardInfos:', newCardInfos);
      return newCardInfos;
    });
  };

  const handlePaidByChange = (index: number, value: 'person1' | 'person2') => {
    const newCardInfos = [...cardInfos];
    newCardInfos[index] = { ...newCardInfos[index], paidBy: value };
    setCardInfos(newCardInfos);
  };

  const handleClassificationChange = (index: number, value: 'person1' | 'person2' | 'shared' | 'skip') => {
    const newCardInfos = [...cardInfos];
    newCardInfos[index] = { ...newCardInfos[index], autoClassification: value };
    setCardInfos(newCardInfos);
  };

  const handleNextStep = () => {
    const trimmedInfos = cardInfos.map(info => ({
      ...info,
      name: info.name.trim()
    }));
    
    if (trimmedInfos.every(info => info.name.length > 0)) {
      setCardInfos(trimmedInfos);
      setStep('classification');
    }
  };

  const handleConfirm = () => {
    onConfirm(cardInfos);
    setCardInfos([]);
    setStep('names');
  };

  const handleCancel = () => {
    onCancel();
    setCardInfos([]);
    setStep('names');
  };

  const allFieldsFilled = cardInfos.length === fileNames.length && 
    cardInfos.every(info => info.name.trim().length > 0);

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case 'person1': return 'text-blue-600';
      case 'person2': return 'text-green-600';
      case 'shared': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getClassificationIcon = (classification?: string) => {
    switch (classification) {
      case 'person1': return <User className="w-4 h-4 text-blue-600" />;
      case 'person2': return <User className="w-4 h-4 text-green-600" />;
      case 'shared': return <Share className="w-4 h-4 text-purple-600" />;
      default: return <SkipForward className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {step === 'names' ? 'Card/Account Information' : 'Card Classification'} ({fileNames.length} files)
          </DialogTitle>
          <DialogDescription>
            {step === 'names' 
              ? 'Please provide the card/account name and who pays the bill for each file you\'re uploading.'
              : 'Set automatic categorization rules for each card to save time on transaction classification.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'names' && (
          <div className="space-y-6">
            {fileNames.map((fileName, index) => {
              const currentCardInfo = cardInfos[index];
              const currentValue = currentCardInfo?.name || '';
              console.log('CardNameDialog: Rendering SmartCardInput for index:', index, 'with value:', currentValue);
              
              return (
                <div key={`${fileName}-${index}`} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600">
                    <strong>File {index + 1}:</strong> {fileName}
                  </div>
                  
                  <SmartCardInput
                    value={currentValue}
                    onChange={(value) => handleCardNameChange(index, value)}
                  />

                  <div className="space-y-3">
                    <Label>Bill paid by <span className="text-sm text-gray-500">(who pays the bill of this card?)</span></Label>
                    <RadioGroup
                      value={currentCardInfo?.paidBy || 'person1'}
                      onValueChange={(value: 'person1' | 'person2') => handlePaidByChange(index, value)}
                      className="flex gap-6"
                    >
                      <Label htmlFor={`person1-${index}`} className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="person1" id={`person1-${index}`} />
                        <span className="font-normal">
                          {categoryNames.person1}
                        </span>
                      </Label>
                      <Label htmlFor={`person2-${index}`} className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="person2" id={`person2-${index}`} />
                        <span className="font-normal">
                          {categoryNames.person2}
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 'classification' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Auto-Classification:</strong> Most couples have dedicated cards for different purposes. 
                This will automatically categorize all transactions from each card. You can manually adjust 
                individual transactions that don't fit this rule afterwards.
              </p>
            </div>

            {cardInfos.map((cardInfo, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cardInfo.name}</h4>
                    <p className="text-sm text-gray-500">File: {fileNames[index]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getClassificationIcon(cardInfo.autoClassification)}
                    <span className={`text-sm font-medium ${getClassificationColor(cardInfo.autoClassification)}`}>
                      {cardInfo.autoClassification === 'person1' && categoryNames.person1}
                      {cardInfo.autoClassification === 'person2' && categoryNames.person2}
                      {cardInfo.autoClassification === 'shared' && categoryNames.shared}
                      {cardInfo.autoClassification === 'skip' && 'No auto-classification'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Classify all expenses from this card as:</Label>
                  <RadioGroup
                    value={cardInfo.autoClassification || 'skip'}
                    onValueChange={(value: 'person1' | 'person2' | 'shared' | 'skip') => 
                      handleClassificationChange(index, value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label htmlFor={`class-person1-${index}`} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <RadioGroupItem value="person1" id={`class-person1-${index}`} />
                      <span className="font-normal text-blue-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {categoryNames.person1}
                      </span>
                    </Label>
                    <Label htmlFor={`class-person2-${index}`} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                      <RadioGroupItem value="person2" id={`class-person2-${index}`} />
                      <span className="font-normal text-green-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {categoryNames.person2}
                      </span>
                    </Label>
                    <Label htmlFor={`class-shared-${index}`} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                      <RadioGroupItem value="shared" id={`class-shared-${index}`} />
                      <span className="font-normal text-purple-600 flex items-center gap-2">
                        <Share className="w-4 h-4" />
                        {categoryNames.shared}
                      </span>
                    </Label>
                    <Label htmlFor={`class-skip-${index}`} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="skip" id={`class-skip-${index}`} />
                      <span className="font-normal text-gray-600 flex items-center gap-2">
                        <SkipForward className="w-4 h-4" />
                        Skip auto-classification
                      </span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={step === 'names' ? handleCancel : () => setStep('names')}>
            {step === 'names' ? 'Cancel' : 'Back'}
          </Button>
          {step === 'names' ? (
            <Button 
              onClick={handleNextStep}
              disabled={!allFieldsFilled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Classification
            </Button>
          ) : (
            <Button 
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Process Files
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardNameDialog;
