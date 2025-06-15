
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
import { CheckCircle, AlertTriangle, FileText } from "lucide-react";

interface DuplicateReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateMatch[];
  totalTransactions: number;
  uniqueTransactions: number;
  onConfirm: (decisions: DuplicateReviewDecision[]) => void;
  onCancel: () => void;
}

const DuplicateReviewModal = ({ 
  open, 
  onOpenChange, 
  duplicates, 
  totalTransactions,
  uniqueTransactions,
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

  const finalUploadCount = uniqueTransactions + selectedDuplicates.size;
  const skippedDuplicates = duplicates.length - selectedDuplicates.size;
  const hasZeroTransactions = finalUploadCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Duplicate Transactions (Step 2 of 3)</DialogTitle>
          <DialogDescription>
            We found potential duplicates in your upload. Review them below to decide what to include.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Upload Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Total transactions in file:</span>
                <span className="font-bold text-gray-900">{totalTransactions}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Unique transactions: <strong>{uniqueTransactions}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-700">Duplicates found: <strong>{duplicates.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Duplicate Review Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Review Duplicate Transactions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Include All Duplicates
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Skip All Duplicates
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Include</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>New Card</TableHead>
                    <TableHead>Existing Card</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicates.map((duplicate, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedDuplicates.has(index)}
                          onCheckedChange={() => toggleDuplicate(index)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{formatDate(duplicate.newTransaction.date)}</TableCell>
                      <TableCell className="font-medium">{formatAmount(duplicate.newTransaction.amount)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={duplicate.newTransaction.description}>
                          {duplicate.newTransaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {duplicate.newTransaction.cardName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {duplicate.existingTransaction.cardName}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Final Upload Summary - Different styling for zero transactions */}
          <div className={`${hasZeroTransactions ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-3">
              {hasZeroTransactions ? (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <h3 className={`font-semibold ${hasZeroTransactions ? 'text-orange-900' : 'text-green-900'}`}>
                {hasZeroTransactions ? 'Upload Result' : 'Final Upload Summary'}
              </h3>
            </div>
            
            {hasZeroTransactions ? (
              <div className="space-y-2 text-sm">
                <div className="text-orange-800 font-medium mb-2">
                  All transactions in your file are duplicates and none were selected.
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">• {uniqueTransactions} unique transactions</span>
                  <span className="text-orange-700 font-medium">No new transactions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">• {selectedDuplicates.size} selected duplicates</span>
                  <span className="text-orange-700 font-medium">None selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">• {skippedDuplicates} duplicate transactions</span>
                  <span className="text-orange-700 font-medium">⚠ Will be skipped</span>
                </div>
                <div className="pt-2 border-t border-orange-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-orange-900">No transactions will be uploaded</span>
                    <span className="text-orange-900">0</span>
                  </div>
                </div>
                <div className="text-xs text-orange-700 mt-2">
                  💡 If you want to upload duplicates anyway, select them above
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">• {uniqueTransactions} unique transactions</span>
                  <span className="text-green-700 font-medium">✓ Will be uploaded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">• {selectedDuplicates.size} selected duplicates</span>
                  <span className="text-green-700 font-medium">✓ Will be uploaded</span>
                </div>
                {skippedDuplicates > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">• {skippedDuplicates} duplicate transactions</span>
                    <span className="text-orange-700 font-medium">⚠ Will be skipped</span>
                  </div>
                )}
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-green-900">Total transactions to upload:</span>
                    <span className="text-green-900">{finalUploadCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Different text for zero transactions */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onCancel} className="min-w-[160px]">
              Cancel Entire Upload
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="min-w-[200px]"
              variant={hasZeroTransactions ? "outline" : "default"}
            >
              {hasZeroTransactions 
                ? "Close - No Upload Needed" 
                : `Continue Upload (${finalUploadCount} transactions)`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateReviewModal;
