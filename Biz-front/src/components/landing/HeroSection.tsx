import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

import { Link } from "react-router-dom";


const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/75" />
      </div>
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Building Nigeria's Economic Future</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Buy, Sell & Earn
            </span>
            {" "}on Nigeria's Rewarding Marketplace
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong className="text-foreground">Buyers:</strong> Earn 20% Loyalty rewards on every purchase. Buy more goods with your loyalty rewards.
            <br />
            <strong className="text-foreground">Sellers:</strong> List your Nigerian Products and pay 10% loyalty on all items you sell.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Designated Bank Account</h3>
              <p className="text-sm text-muted-foreground">Get a bank account from paystack, which enables you to deposit, withdraw and make purchases. </p>
            </div>

                        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Online Market Place</h3>
              <p className="text-sm text-muted-foreground">Upload your Nigerian made products and attract our online buyers, you can also purchase items and materials for your trade.</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Escrow and Delivery</h3>
              <p className="text-sm text-muted-foreground">We handle pick up and delivery (intra state only) and we secure payment of funds in our in-app escrow.</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Seller's Fee</h3>
              <p className="text-sm text-muted-foreground">Give your buyers 10% loyalty on the value of every sale and pay platform fee of 2.5% your monthly sales value.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

          
                  <Link to="/register"> {/* ✅ Correct routing for Vite + React Router */}
        <Button size="lg" variant="hero" className="group">
          Start Trading Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>

            <Button size="lg" variant="outline">
              Learn How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
