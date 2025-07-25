import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Users, User, Zap, Hand, History as HistoryIcon, CheckCircle, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { unifiedTransactionStore } from '@/store/unifiedTransactionStore';
import { Transaction } from '@/types/transaction';
import TransactionMCCEmoji from '@/components/TransactionMCCEmoji';
import { getCategoryNames } from '@/utils/categoryNames';

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const latestTransactions = await unifiedTransactionStore.getTransactions();
      console.log(`[History] Loaded ${latestTransactions.length} transactions from unified store`);
      setTransactions(latestTransactions);
    };
    
    loadTransactions();
    
    const unsubscribe = unifiedTransactionStore.subscribe(async () => {
      const latestTransactions = await unifiedTransactionStore.getTransactions();
      setTransactions(latestTransactions);
    });
    
    return unsubscribe;
  }, []);

  const categoryNames = getCategoryNames();

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || 
      (filterCategory === "shared" && transaction.category === "shared") ||
      (filterCategory === "personal" && (transaction.category === "person1" || transaction.category === "person2")) ||
      (filterCategory === "unclassified" && transaction.category === "UNCLASSIFIED");
    const transactionMonth = new Date(transaction.date).toISOString().substring(0, 7);
    const matchesMonth = filterMonth === "all" || transactionMonth === filterMonth;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Separate paid and unpaid transactions
  const paidTransactions = transactions.filter(t => t.isPaid);
  const unpaidTransactions = transactions.filter(t => !t.isPaid);
  
  // Group paid transactions by settlement date for settlement history
  const settlementGroups = paidTransactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
    if (transaction.markedPaidAt) {
      const settlementDate = new Date(transaction.markedPaidAt).toISOString().split('T')[0];
      if (!groups[settlementDate]) {
        groups[settlementDate] = [];
      }
      groups[settlementDate].push(transaction);
    }
    return groups;
  }, {});

  const totalSettlements = Object.keys(settlementGroups).length;
  const totalSettlementAmount = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const sharedAmount = filteredTransactions.filter(t => t.category === "shared").reduce((sum, t) => sum + t.amount, 0);
  const personalAmount = filteredTransactions.filter(t => t.category === "person1" || t.category === "person2").reduce((sum, t) => sum + t.amount, 0);
  const unclassifiedAmount = filteredTransactions.filter(t => t.category === "UNCLASSIFIED").reduce((sum, t) => sum + t.amount, 0);

  const getCategoryBadge = (transaction: Transaction) => {
    if (transaction.category === "shared") {
      return (
        <Badge variant="default" className="flex items-center">
          <Users className="w-3 h-3 mr-1" />
          {categoryNames.shared}
        </Badge>
      );
    } else if (transaction.category === "person1") {
      return (
        <Badge variant="secondary" className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {categoryNames.person1}
        </Badge>
      );
    } else if (transaction.category === "person2") {
      return (
        <Badge variant="secondary" className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {categoryNames.person2}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center">
          <Filter className="w-3 h-3 mr-1" />
          Unclassified
        </Badge>
      );
    }
  };

  const getPaidByBadge = (transaction: Transaction) => {
    const paidByName = transaction.paidBy === "person1" ? categoryNames.person1 : categoryNames.person2;
    return (
      <Badge variant="outline" className="text-xs">
        Paid by {paidByName}
      </Badge>
    );
  };

  const months = Array.from(new Set(transactions.map(t => new Date(t.date).toISOString().substring(0, 7)))).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense History</h1>
        <p className="text-gray-600">
          View and analyze your past expenses, spending patterns, and settlement history
        </p>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="settlements">Settlement History</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6 mt-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{filteredTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${sharedAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalAmount > 0 ? Math.round((sharedAmount / totalAmount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Personal Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${personalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalAmount > 0 ? Math.round((personalAmount / totalAmount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unclassified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${unclassifiedAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalAmount > 0 ? Math.round((unclassifiedAmount / totalAmount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

          {/* Filters */}
          <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="shared">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Shared
                  </div>
                </SelectItem>
                <SelectItem value="personal">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Personal
                  </div>
                </SelectItem>
                <SelectItem value="unclassified">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Unclassified
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

          {/* Enhanced Transactions List */}
          <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Transaction Details</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
              >
                <div className="flex items-start space-x-4 flex-1">
                  {/* MCC Emoji or Manual Entry Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <TransactionMCCEmoji 
                      mccCode={transaction.mccCode}
                      bankCategory={transaction.bankCategory}
                      description={transaction.description}
                      isManualEntry={transaction.isManualEntry}
                    />
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </h3>
                      {transaction.autoAppliedRule && (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      )}
                      {transaction.isManualEntry && (
                        <Hand className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    
                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span className="font-medium">{transaction.cardName}</span>
                      <span>•</span>
                      <span className="font-semibold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </span>
                      {transaction.location && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{transaction.location}</span>
                        </>
                      )}
                    </div>

                    {/* Additional metadata if available */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      {transaction.transactionType && (
                        <span>Type: {transaction.transactionType}</span>
                      )}
                      {transaction.referenceNumber && (
                        <span>Ref: {transaction.referenceNumber}</span>
                      )}
                      {transaction.mccCode && (
                        <span>MCC: {transaction.mccCode}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                     {/* Right side - Categories and Payment Info */}
                 <div className="flex flex-col items-end space-y-2 ml-4">
                   <div className="flex items-center space-x-2">
                     {getCategoryBadge(transaction)}
                     {transaction.isPaid && (
                       <Badge variant="default" className="bg-green-600 text-white flex items-center">
                         <CheckCircle className="w-3 h-3 mr-1" />
                         PAID
                       </Badge>
                     )}
                   </div>
                   {getPaidByBadge(transaction)}
                   {transaction.isPaid && transaction.markedPaidAt && (
                     <span className="text-xs text-gray-500">
                       Paid: {new Date(transaction.markedPaidAt).toLocaleDateString()}
                     </span>
                   )}
                 </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
        
        </TabsContent>

        <TabsContent value="settlements" className="space-y-6 mt-6">
          {/* Settlement History Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Settlement History</h2>
              <p className="text-sm text-gray-600">Track your payment cycles and verification checkpoints</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Records
            </Button>
          </div>

          {/* Settlement Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Settlements
                </CardTitle>
              </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">${totalSettlementAmount.toFixed(2)}</div>
                 <p className="text-xs text-gray-500 mt-1">{totalSettlements} payment cycles</p>
               </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">$0.00</div>
                <p className="text-xs text-gray-500 mt-1">No settlements yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <p className="text-xs text-gray-500 mt-1">All settlements verified</p>
              </CardContent>
            </Card>
          </div>

          {/* Settlement Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="w-5 h-5" />
                Settlement Records
              </CardTitle>
              <CardDescription>
                Previous payment cycles and verification history
              </CardDescription>
            </CardHeader>
             <CardContent>
               {totalSettlements === 0 ? (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <HistoryIcon className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">No settlement history yet</h3>
                   <p className="text-gray-600 mb-4">
                     Your payment cycles and verification checkpoints will appear here after your first settlement.
                   </p>
                   <Button variant="outline" onClick={() => window.location.href = '/app/categorize'}>
                     Start Categorizing Expenses
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {Object.entries(settlementGroups)
                     .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                     .map(([settlementDate, settlementTransactions]) => {
                       const totalAmount = settlementTransactions.reduce((sum, t) => sum + t.amount, 0);
                       return (
                         <div key={settlementDate} className="border rounded-lg p-4 bg-green-50 border-green-200">
                           <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-2">
                               <CheckCircle className="w-5 h-5 text-green-600" />
                               <h3 className="font-medium text-gray-900">
                                 Settlement - {new Date(settlementDate).toLocaleDateString()}
                               </h3>
                             </div>
                             <Badge variant="default" className="bg-green-600">
                               ${totalAmount.toFixed(2)}
                             </Badge>
                           </div>
                           <p className="text-sm text-gray-600 mb-3">
                             {settlementTransactions.length} transactions marked as paid
                           </p>
                           <div className="space-y-2">
                             {settlementTransactions.slice(0, 3).map(transaction => (
                               <div key={transaction.id} className="flex items-center justify-between text-sm">
                                 <span className="text-gray-700">{transaction.description}</span>
                                 <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                               </div>
                             ))}
                             {settlementTransactions.length > 3 && (
                               <p className="text-xs text-gray-500">
                                 ...and {settlementTransactions.length - 3} more transactions
                               </p>
                             )}
                           </div>
                         </div>
                       );
                     })}
                 </div>
               )}
             </CardContent>
          </Card>

          {/* Verification Checkpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Verification Checkpoints
              </CardTitle>
              <CardDescription>
                Automated checks and approval history for settlements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Transaction Categorization</span>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium">Calculation Review</span>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium">Payment Verification</span>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
