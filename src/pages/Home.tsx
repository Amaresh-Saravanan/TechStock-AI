import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Heart,
  Layers,
  Zap,
  TrendingUp,
  BarChart3,
  Bell,
  Cpu,
  Check,
  ChevronRight,
  Globe,
  Shield,
  Rocket,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">TechStock AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
            AI-Powered Inventory Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">TECH</span>
            <span className="text-primary">STOCK</span>
            <span className="text-white"> AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Say hello to the smartest inventory management platform powered by artificial intelligence for tech retailers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-lg">
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-slate-600 text-white hover:bg-slate-800">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Monitor className="h-12 w-12" />}
              title="FULLY RESPONSIVE"
              description="Access your inventory from any device - desktop, tablet, or mobile with a seamless experience."
            />
            <FeatureCard
              icon={<Heart className="h-12 w-12" />}
              title="BUILT WITH CARE"
              description="Developed with attention to detail, every feature is crafted to enhance your workflow."
            />
            <FeatureCard
              icon={<Layers className="h-12 w-12" />}
              title="MULTI-PLATFORM"
              description="Integrate with multiple e-commerce platforms and manage all your inventory in one place."
            />
            <FeatureCard
              icon={<Zap className="h-12 w-12" />}
              title="REAL-TIME SYNC"
              description="Lightning-fast synchronization ensures your data is always up-to-date across all channels."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              ABOUT <span className="text-primary">US</span>
            </h2>
            <p className="text-primary uppercase tracking-widest mb-6">We Create Awesome Solutions</p>
            <p className="text-slate-400 max-w-2xl mx-auto">
              TechStock AI revolutionizes how tech retailers manage their inventory with cutting-edge artificial intelligence and machine learning algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AboutCard
              icon={<TrendingUp className="h-16 w-16" />}
              title="AI PREDICTIONS"
              description="Our advanced AI analyzes market trends, seasonal patterns, and historical data to predict demand and optimize your stock levels automatically."
            />
            <AboutCard
              icon={<BarChart3 className="h-16 w-16" />}
              title="SMART ANALYTICS"
              description="Get deep insights into your inventory performance with real-time analytics, custom reports, and actionable recommendations."
            />
            <AboutCard
              icon={<Bell className="h-16 w-16" />}
              title="INTELLIGENT ALERTS"
              description="Stay ahead with smart notifications for low stock, price changes, trending products, and potential supply chain issues."
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              OUR <span className="text-primary">SERVICES</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comprehensive solutions designed to streamline your tech retail operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={<Globe className="h-10 w-10" />}
              title="Price Tracking"
              description="Monitor competitor prices across multiple platforms and adjust your pricing strategy in real-time."
            />
            <ServiceCard
              icon={<Cpu className="h-10 w-10" />}
              title="Build Generator"
              description="AI-powered PC build recommendations based on customer requirements and current inventory."
            />
            <ServiceCard
              icon={<Shield className="h-10 w-10" />}
              title="Inventory Security"
              description="Advanced security features to protect your inventory data and prevent unauthorized access."
            />
            <ServiceCard
              icon={<Rocket className="h-10 w-10" />}
              title="Quick Integration"
              description="Seamlessly integrate with your existing e-commerce platforms and ERP systems."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-primary">Plan</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Flexible pricing plans designed to scale with your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Individual Plan */}
            <Card className="bg-slate-800/50 border-slate-700 relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Individual</CardTitle>
                <p className="text-slate-400 text-sm">For small retailers & freelancers</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-slate-500 line-through text-lg">$29.99</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$19</span>
                    <span className="text-2xl text-white">.99</span>
                  </div>
                  <p className="text-slate-400 text-sm">Billed each month/ Per user</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Up to 1,000 SKUs</PricingFeature>
                  <PricingFeature>Basic AI predictions</PricingFeature>
                  <PricingFeature>Price tracking (5 competitors)</PricingFeature>
                  <PricingFeature>Email support</PricingFeature>
                  <PricingFeature>Basic analytics dashboard</PricingFeature>
                </ul>
                <Link to="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Plan - Featured */}
            <Card className="bg-gradient-to-b from-primary/20 to-primary/5 border-primary relative overflow-hidden scale-105 shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1">
                POPULAR
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Team</CardTitle>
                <p className="text-slate-400 text-sm">For growing businesses</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-slate-500 line-through text-lg">$49.99</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$34</span>
                    <span className="text-2xl text-white">.99</span>
                  </div>
                  <p className="text-slate-400 text-sm">Billed each month/ Per user</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature highlighted>Up to 10,000 SKUs</PricingFeature>
                  <PricingFeature highlighted>Advanced AI predictions</PricingFeature>
                  <PricingFeature highlighted>Unlimited price tracking</PricingFeature>
                  <PricingFeature highlighted>Team collaboration (up to 5)</PricingFeature>
                  <PricingFeature highlighted>Priority support</PricingFeature>
                  <PricingFeature highlighted>Custom reports</PricingFeature>
                </ul>
                <Link to="/register">
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                    Get Team Access
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro+ Plan */}
            <Card className="bg-slate-800/50 border-slate-700 relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Pro+</CardTitle>
                <p className="text-slate-400 text-sm">For enterprise retailers</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-slate-500 line-through text-lg">$99.99</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$59</span>
                    <span className="text-2xl text-white">.99</span>
                  </div>
                  <p className="text-slate-400 text-sm">Billed each month/ Per user</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Unlimited SKUs</PricingFeature>
                  <PricingFeature>Enterprise AI models</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Dedicated account manager</PricingFeature>
                  <PricingFeature>24/7 phone support</PricingFeature>
                  <PricingFeature>Custom integrations</PricingFeature>
                </ul>
                <Link to="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Get Pro+ Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="font-bold">TechStock AI</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 TechStock AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="text-center p-8 group">
    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-slate-200 dark:border-slate-700 mb-6 group-hover:border-primary group-hover:text-primary transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

// About Card Component
const AboutCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="text-center p-8">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-slate-600 text-primary mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">
      {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
    </h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

// Service Card Component
const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

// Pricing Feature Component
const PricingFeature = ({ children, highlighted = false }: { children: React.ReactNode; highlighted?: boolean }) => (
  <li className="flex items-center gap-3">
    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${highlighted ? 'bg-primary' : 'bg-primary/20'}`}>
      <Check className={`h-3 w-3 ${highlighted ? 'text-white' : 'text-primary'}`} />
    </div>
    <span className="text-slate-300 text-sm">{children}</span>
  </li>
);

export default Home;
