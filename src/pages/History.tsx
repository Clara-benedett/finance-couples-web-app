
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Users, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { transactionStore } from '@/store/transactionStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Transaction } from '@/types/transaction';


const History = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const activeStore = isSupabaseConfigured && user ? supabaseTransactionStore : transactionStore;

  useEffect(() => {
    const loadTransactions = async () => {
      // Ensure store is initialized before getting transactions
      if (isSupabaseConfigured && user) {
        // Wait a bit for supabase store initialization
        setTimeout(() => {
          setTransactions(activeStore.getTransactions());
        }, 100);
      } else {
        setTransactions(activeStore.getTransactions());
      }
    };
    
    loadTransactions();
    
    const unsubscribe = activeStore.subscribe(() => {
      setTransactions(activeStore.getTransactions());
    });
    
    return unsubscribe;
  }, [activeStore, user]);

  const expenses = transactions.map(t => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    date: t.date,
    category: t.category === 'person1' || t.category === 'person2' ? "personal" : "shared",
    month: new Date(t.date).toISOString().substring(0, 7)
  }));

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    const matchesMonth = filterMonth === "all" || expense.month === filterMonth;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const sharedAmount = filteredExpenses.filter(e => e.category === "shared").reduce((sum, expense) => sum + expense.amount, 0);
  const personalAmount = filteredExpenses.filter(e => e.category === "personal").reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryBadge = (category: "shared" | "personal") => {
    const Icon = category === "shared" ? Users : User;
    return (
      <Badge 
        variant={category === "shared" ? "default" : "secondary"} 
        className="flex items-center"
      >
        <Icon className="w-3 h-3 mr-1" />
        {category === "shared" ? "Shared" : "Personal"}
      </Badge>
    );
  };

  const months = Array.from(new Set(expenses.map(e => e.month))).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense History</h1>
        <p className="text-gray-600">
          View and analyze your past expenses and spending patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{filteredExpenses.length} transactions</p>
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

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Transactions</CardTitle>
          <CardDescription>
            {filteredExpenses.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{expense.description}</h3>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${expense.amount.toFixed(2)}</div>
                  </div>
                  {getCategoryBadge(expense.category as "shared" | "personal")}
                </div>
              </div>
            ))}
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8">
                <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
