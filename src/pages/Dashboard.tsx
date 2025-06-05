
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Expenses",
      value: "$2,847.50",
      description: "This month",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Shared Expenses",
      value: "$1,923.20",
      description: "67% of total",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Personal Expenses",
      value: "$924.30",
      description: "33% of total",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to CoupleFinance</h1>
        <p className="text-blue-100 mb-6">
          Track, categorize, and split your expenses seamlessly as a couple
        </p>
        <Button 
          onClick={() => navigate("/upload")}
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Expenses
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Quick Upload</CardTitle>
            <CardDescription>
              Upload your latest credit card statements to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/upload")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Statements
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Review Categories</CardTitle>
            <CardDescription>
              Review and adjust expense categories for better tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/categorize")}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Categorize Expenses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Recent Activity</CardTitle>
          <CardDescription>Your latest expense uploads and categorizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Grocery Store - $127.50</p>
                <p className="text-sm text-gray-500">Categorized as Shared • 2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Shared
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Coffee Shop - $12.75</p>
                <p className="text-sm text-gray-500">Categorized as Personal • 5 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Personal
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
