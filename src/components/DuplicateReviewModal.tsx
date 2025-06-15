
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { DuplicateMatch, DuplicateReviewDecision } from "@/types/duplicateDetection";
import { format } from "date-fns";

interface DuplicateReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateMatch[];
  onConfirm: (decisions: DuplicateReviewDecision[]) => void;
  onCancel: () => void;
}

const DuplicateReviewModal = ({ 
  open, 
  onOpenChange, 
  duplicates, 
  onConfirm, 
  onCancel 
}: DuplicateReviewModalProps) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());

  const toggleDuplicate = (index: number) => {
    const newSelected = new Set(selectedDuplicates);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedDuplicates(newSelected);
  };

  const selectAll = () => {
    setSelectedDuplicates(new Set(duplicates.map((_, index) => index)));
  };

  const selectNone = () => {
    setSelectedDuplicates(new Set());
  };

  const handleConfirm = () => {
    const decisions: DuplicateReviewDecision[] = duplicates.map((_, index) => ({
      duplicateIndex: index,
      shouldInclude: selectedDuplicates.has(index)
    }));
    onConfirm(decisions);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Duplicate Transactions Detected</DialogTitle>
          <DialogDescription>
            We found {duplicates.length} transactions that appear to already exist in your system. 
            Review them below and select any you want to include anyway.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone}>
              Select None
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Include</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>New Card</TableHead>
                  <TableHead>Existing Card</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicates.map((duplicate, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDuplicates.has(index)}
                        onCheckedChange={() => toggleDuplicate(index)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(duplicate.newTransaction.date)}</TableCell>
                    <TableCell>{formatAmount(duplicate.newTransaction.amount)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {duplicate.newTransaction.description}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {duplicate.newTransaction.cardName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {duplicate.existingTransaction.cardName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedDuplicates.size} of {duplicates.length} duplicates selected to include
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel Upload
              </Button>
              <Button onClick={handleConfirm}>
                Upload Selected Transactions
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateReviewModal;
