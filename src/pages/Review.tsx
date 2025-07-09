
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Circle, Users, User, ArrowRight, Edit, ChevronDown } from "lucide-react";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { Transaction } from "@/types/transaction";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import TransactionMCCEmoji from "@/components/TransactionMCCEmoji";
import { useToast } from "@/hooks/use-toast";

const Review = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [approvedCategories, setApprovedCategories] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { categoryNames } = useCategoryNames();
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      const allTransactions = await unifiedTransactionStore.getTransactions();
      setTransactions(allTransactions);
      
      // Set all categories with data as open by default
      const categoriesWithData = Object.entries({
        shared: allTransactions.filter(t => t.category === 'shared'),
        person1: allTransactions.filter(t => t.category === 'person1'),
        person2: allTransactions.filter(t => t.category === 'person2'),
        unclassified: allTransactions.filter(t => t.category === 'UNCLASSIFIED'),
      })
        .filter(([_, transactions]) => transactions.length > 0)
        .map(([category, _]) => category);
      
      setOpenCategories(categoriesWithData);
    };
    loadTransactions();
  }, []);

  // Group transactions by category
  const categorizedTransactions = {
    shared: transactions.filter(t => t.category === 'shared'),
    person1: transactions.filter(t => t.category === 'person1'),
    person2: transactions.filter(t => t.category === 'person2'),
    unclassified: transactions.filter(t => t.category === 'UNCLASSIFIED'),
  };

  const handleCategoryApproval = (category: string) => {
    const newApproved = new Set(approvedCategories);
    if (newApproved.has(category)) {
      newApproved.delete(category);
      // If unapproving, open the category again
      if (!openCategories.includes(category)) {
        setOpenCategories([...openCategories, category]);
      }
    } else {
      newApproved.add(category);
      // Auto-collapse when approved
      setOpenCategories(openCategories.filter(cat => cat !== category));
    }
    setApprovedCategories(newApproved);
    
    toast({
      title: newApproved.has(category) ? "Category Approved" : "Approval Removed",
      description: `${getCategoryDisplayName(category)} expenses ${newApproved.has(category) ? 'approved' : 'approval removed'}`,
    });
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'shared': return categoryNames.shared;
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'unclassified': return 'Unclassified';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shared': return <Users className="w-4 h-4" />;
      case 'person1': return <User className="w-4 h-4" />;
      case 'person2': return <User className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryTotal = (category: string) => {
    return categorizedTransactions[category as keyof typeof categorizedTransactions]
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;
  };

  const renderCategorySection = (category: string, transactions: Transaction[]) => {
    if (transactions.length === 0) return null;

    const total = getCategoryTotal(category);
    const isApproved = approvedCategories.has(category);
    const displayName = getCategoryDisplayName(category);

    return (
      <AccordionItem key={category} value={category} className="border rounded-lg mb-4">
        <Card className="border-0">
          <AccordionTrigger className="hover:no-underline p-0">
            <CardHeader className="w-full">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <CardTitle className="text-xl">{displayName}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-gray-900 mt-1">
                      ${total.toFixed(2)}
                    </CardDescription>
                    <p className="text-sm text-gray-500 mt-1">
                      {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={isApproved ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryApproval(category);
                    }}
                    className="flex items-center gap-2"
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        Review & Approve
                      </>
                    )}
                  </Button>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </div>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TransactionMCCEmoji 
                        mccCode={transaction.mccCode}
                        bankCategory={transaction.bankCategory}
                        description={transaction.description}
                        isManualEntry={transaction.isManualEntry}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{transaction.date}</span>
                          <span>•</span>
                          <span>{transaction.cardName}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            Paid by {transaction.paidBy === 'person1' ? categoryNames.person1 : categoryNames.person2}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/app/categorize')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    );
  };

  const categoriesWithData = Object.entries(categorizedTransactions)
    .filter(([_, transactions]) => transactions.length > 0)
    .map(([category, _]) => category);

  const allCategoriesApproved = categoriesWithData.length > 0 && 
    categoriesWithData.every(category => approvedCategories.has(category));

  const handleProceedToCalculations = () => {
    navigate('/app/payment');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Verify</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please review your categorized expenses below. Verify that each transaction is in the correct category 
          and approve each section before proceeding to calculations.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              {approvedCategories.size} of {categoriesWithData.length} categories approved
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {Math.round((approvedCategories.size / Math.max(categoriesWithData.length, 1)) * 100)}% complete
          </div>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(approvedCategories.size / Math.max(categoriesWithData.length, 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Category Sections with Accordion */}
      <Accordion 
        type="multiple" 
        value={openCategories}
        onValueChange={setOpenCategories}
        className="space-y-4"
      >
        {renderCategorySection('shared', categorizedTransactions.shared)}
        {renderCategorySection('person1', categorizedTransactions.person1)}
        {renderCategorySection('person2', categorizedTransactions.person2)}
        {renderCategorySection('unclassified', categorizedTransactions.unclassified)}
      </Accordion>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t p-4 -mx-6 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/app/categorize')}
          >
            Back to Categorize
          </Button>
          
          <Button
            onClick={handleProceedToCalculations}
            disabled={!allCategoriesApproved}
            className="flex items-center gap-2"
          >
            Proceed to Calculations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Review;
