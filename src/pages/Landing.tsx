import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, Zap, TrendingUp, Lock, CreditCard, RotateCcw } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  console.log("Landing component rendering");

  const handleGetStarted = () => {
    console.log("Get started clicked, navigating to /auth");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">Couply</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Button variant="ghost" onClick={handleGetStarted} className="text-muted-foreground hover:text-foreground">
                Log In
              </Button>
              <Button onClick={handleGetStarted}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full animate-[float_6s_ease-in-out_infinite] [animation-delay:-2s]"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full animate-[float_6s_ease-in-out_infinite] [animation-delay:-4s]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Stop Fighting About Money.
                  <span className="text-yellow-300"> Start Splitting Smart.</span>
                </h1>
                <p className="text-xl text-purple-100 leading-relaxed">
                  Turn your 2-hour monthly expense nightmare into a 15-minute breeze. Upload your statements, let AI categorize everything, and know exactly who owes what.
                </p>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-yellow-300 text-sm font-semibold">★★★★★</div>
                  <div className="text-purple-100 text-sm">Loved by 1,000+ couples</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-yellow-400 text-gray-900 px-8 py-4 h-auto text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Free Trial - No Card Required
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 h-auto text-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
                >
                  Watch 2-Min Demo →
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-6 text-purple-100 text-sm">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5" />
                  <span>30-day money back</span>
                </div>
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div className="relative animate-fade-in [animation-delay:200ms]">
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* App Screenshot Mockup */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">December 2024</h3>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        All Categorized ✓
                      </div>
                    </div>

                    {/* Settlement Card */}
                    <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-6 text-center">
                      <div className="text-sm text-orange-700 mb-2">Final Settlement</div>
                      <div className="text-3xl font-bold text-orange-600 mb-2">$247.50</div>
                      <div className="text-orange-800">Sarah owes Alex</div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-600">Alex</div>
                        <div className="font-bold text-blue-600">$1,234</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-600">Sarah</div>
                        <div className="font-bold text-green-600">$986</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-600">Shared</div>
                        <div className="font-bold text-purple-600">$2,150</div>
                      </div>
                    </div>

                    {/* Sample Transactions */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white rounded-lg p-3">
                        <div>
                          <div className="font-medium text-gray-900">Whole Foods</div>
                          <div className="text-sm text-gray-500">Dec 15 • Shared</div>
                        </div>
                        <div className="text-purple-600 font-semibold">$89.50</div>
                      </div>
                      <div className="flex justify-between items-center bg-white rounded-lg p-3">
                        <div>
                          <div className="font-medium text-gray-900">Uber</div>
                          <div className="text-sm text-gray-500">Dec 14 • Alex</div>
                        </div>
                        <div className="text-blue-600 font-semibold">$23.40</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold shadow-lg animate-[float_6s_ease-in-out_infinite]">
                  15 min/month
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-[float_6s_ease-in-out_infinite] [animation-delay:-3s]">
                  AI Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Tired of Spreadsheet Hell Every Month?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              You're not alone. 73% of couples fight about money, and expense splitting is the #1 trigger.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border-l-4 border-red-400">
              <div className="text-red-400 text-4xl mb-4">😤</div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">Hours of Manual Work</h3>
              <p className="text-muted-foreground">
                Downloading statements, copying data to spreadsheets, categorizing hundreds of transactions, doing math calculations... Every. Single. Month.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border-l-4 border-orange-400">
              <div className="text-orange-400 text-4xl mb-4">🧮</div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">Error-Prone Calculations</h3>
              <p className="text-muted-foreground">
                Multiple cards, different percentages, missed transactions. One small mistake and suddenly someone owes $200 more than they should.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border-l-4 border-yellow-400">
              <div className="text-yellow-400 text-4xl mb-4">😠</div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">Monthly Relationship Stress</h3>
              <p className="text-muted-foreground">
                "Did you categorize this right?" "Why am I paying more?" "This doesn't seem fair..." Sound familiar?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Meet Your Personal Finance Referee
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Couply transforms your monthly expense chaos into a transparent, automated process that takes minutes, not hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Feature List */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Smart File Upload</h3>
                  <p className="text-muted-foreground">Drop in CSV, Excel, or OFX files from any bank. We handle Chase, AMEX, Citi, local banks, and international formats.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-lg p-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">AI Auto-Categorization</h3>
                  <p className="text-muted-foreground">After 3 categorizations of the same merchant, we automatically sort future transactions. Whole Foods → Shared. Your gym → Personal.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Custom Split Rules</h3>
                  <p className="text-muted-foreground">Not 50/50? No problem. Set any percentage split (45/55, 30/70, etc.) based on income, preference, or whatever works for you.</p>
                </div>
              </div>
            </div>

            {/* Process Flow */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
                <div className="space-y-6">
                  {/* Before/After */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-red-500 text-2xl mb-2">😓</div>
                      <div className="text-sm text-gray-600">Before Couply</div>
                      <div className="font-bold text-red-600">2-3 hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-500 text-2xl mb-2">😎</div>
                      <div className="text-sm text-gray-600">With Couply</div>
                      <div className="font-bold text-green-600">15 minutes</div>
                    </div>
                  </div>

                  {/* Process Flow */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-4">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                      <span className="text-gray-700">Upload bank files</span>
                      <div className="ml-auto text-green-500">✓ 30 seconds</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-4">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                      <span className="text-gray-700">AI categorizes (90% auto)</span>
                      <div className="ml-auto text-green-500">✓ 5 minutes</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-4">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                      <span className="text-gray-700">Review & settle</span>
                      <div className="ml-auto text-green-500">✓ 10 minutes</div>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="bg-gradient-primary rounded-xl p-6 text-white text-center">
                    <div className="text-lg font-bold">Total Time Saved</div>
                    <div className="text-3xl font-bold">105 minutes/month</div>
                    <div className="text-sm opacity-90">= 21 hours/year!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Stop Fighting About Money?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join 1,000+ couples who've transformed their monthly expense chaos into a 15-minute automated process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              className="bg-yellow-400 text-gray-900 px-8 py-4 h-auto text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Your Free Trial Today
            </Button>
            <div className="text-purple-100 text-sm">
              ✓ No credit card required<br />
              ✓ 30-day money back guarantee
            </div>
          </div>

          {/* Last social proof */}
          <div className="mt-12 flex justify-center items-center space-x-8 text-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1,000+</div>
              <div className="text-sm">Happy couples</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">15 min</div>
              <div className="text-sm">Average time/month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9★</div>
              <div className="text-sm">User rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold">Couply</span>
              </div>
              <p className="text-gray-400">Making expense splitting simple, transparent, and fight-free for couples everywhere.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Couply. All rights reserved. Made with ❤️ for couples everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;