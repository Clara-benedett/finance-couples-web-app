
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, User, ShoppingCart, Car, Home, Coffee } from "lucide-react";
import { useState } from "react";

type ExpenseCategory = "shared" | "personal";

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory | null;
  suggestedCategory: ExpenseCategory;
}

const Categorize = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      description: "Whole Foods Market",
      amount: 127.50,
      date: "2024-01-15",
      category: null,
      suggestedCategory: "shared"
    },
    {
      id: 2,
      description: "Starbucks Coffee",
      amount: 12.75,
      date: "2024-01-15",
      category: null,
      suggestedCategory: "personal"
    },
    {
      id: 3,
      description: "Netflix Subscription",
      amount: 15.99,
      date: "2024-01-14",
      category: null,
      suggestedCategory: "shared"
    },
    {
      id: 4,
      description: "Gas Station",
      amount: 45.20,
      date: "2024-01-14",
      category: null,
      suggestedCategory: "personal"
    },
    {
      id: 5,
      description: "Target Store",
      amount: 89.99,
      date: "2024-01-13",
      category: null,
      suggestedCategory: "shared"
    }
  ]);

  const updateExpenseCategory = (id: number, category: ExpenseCategory) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, category } : expense
      )
    );
  };

  const acceptSuggestion = (id: number) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      updateExpenseCategory(id, expense.suggestedCategory);
    }
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    return category === "shared" ? Users : User;
  };

  const getCategoryBadge = (category: ExpenseCategory | null, suggested?: ExpenseCategory) => {
    if (category) {
      const Icon = getCategoryIcon(category);
      return (
        <Badge variant={category === "shared" ? "default" : "secondary"} className="flex items-center">
          <Icon className="w-3 h-3 mr-1" />
          {category === "shared" ? "Shared" : "Personal"}
        </Badge>
      );
    }
    
    if (suggested) {
      const Icon = getCategoryIcon(suggested);
      return (
        <Badge variant="outline" className="flex items-center border-dashed">
          <Icon className="w-3 h-3 mr-1" />
          Suggested: {suggested === "shared" ? "Shared" : "Personal"}
        </Badge>
      );
    }
    
    return <Badge variant="outline">Uncategorized</Badge>;
  };

  const uncategorizedExpenses = expenses.filter(e => !e.category);
  const categorizedCount = expenses.filter(e => e.category).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
        <p className="text-gray-600">
          Review and categorize your expenses as shared or personal
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Progress</h3>
              <p className="text-gray-500">
                {categorizedCount} of {expenses.length} expenses categorized
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((categorizedCount / expenses.length) * 100)}%
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(categorizedCount / expenses.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {uncategorizedExpenses.length > 0 && (
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Review ({uncategorizedExpenses.length})
          </h2>
        )}
        
        {uncategorizedExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{expense.description}</h3>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${expense.amount.toFixed(2)}</div>
                    {getCategoryBadge(expense.category, expense.suggestedCategory)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value: ExpenseCategory) => updateExpenseCategory(expense.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acceptSuggestion(expense.id)}
                      className="whitespace-nowrap"
                    >
                      Accept Suggestion
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {uncategorizedExpenses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">
                All your expenses have been categorized. Great job!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Categorize;
