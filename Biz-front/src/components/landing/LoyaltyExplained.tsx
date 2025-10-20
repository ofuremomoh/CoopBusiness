import { Card } from "@/components/ui/card";
import { ShoppingBag, Store, Award } from "lucide-react";

const LoyaltyExplained = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Understanding Loyalty Points for Buyers & Sellers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            You can be both a buyer and a seller on our platform. Here's how Loyalty points work for each role:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center">For Buyers</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">What Loyalty Points Mean to You:</h4>
                <p className="text-muted-foreground">
                  Your initial Loyalty allocation (₦100k-₦1M) is your <strong className="text-foreground">selling power</strong> if you decide to sell products. 
                  As a buyer, you earn 20% Loyalty value on every purchase.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Converting Loyalty to Cash:</h4>
                <p className="text-muted-foreground">
                  Your <strong className="text-foreground">earned Loyalty points</strong> (from purchases and mining) can be transferred to your fiat wallet immediately! 
                  When you transfer, Loyalty points are <strong className="text-foreground">debited from your Loyalty wallet</strong> and credited to your fiat wallet.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Earning More Loyalty:</h4>
                <p className="text-muted-foreground">
                  Make purchases to earn Loyalty points. The points are <strong className="text-foreground">credited to your Loyalty wallet</strong>, 
                  increasing your ability to sell products (up to 10x your new Loyalty balance).
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/50">
            <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
              <Store className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center">For Sellers</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">What Loyalty Points Mean to You:</h4>
                <p className="text-muted-foreground">
                  Your Loyalty balance determines your sales capacity. You can list products worth up to <strong className="text-foreground">10x your Loyalty balance</strong>. 
                  When someone buys from you, 10% of your Loyalty points transfer to the buyer.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Boosting Sales with Loyalty:</h4>
                <p className="text-muted-foreground">
                  To increase sales capacity, make purchases to earn Loyalty points. The earned points are <strong className="text-foreground">credited to your wallet</strong>, 
                  instantly multiplying your selling power by 10x the new balance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Replenishing Loyalty:</h4>
                <p className="text-muted-foreground">
                  As you sell, your Loyalty points decrease. To maintain high sales volume, make purchases from others to earn more Loyalty points.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-bold text-center">Loyalty Program Benefits</h3>
          </div>
          <div className="space-y-3 text-center">
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">Transfer to Fiat:</strong> Your Loyalty wallet can be transferred to your fiat wallet anytime
            </p>
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">Earn on Purchases:</strong> Get 20% Loyalty value on every purchase you make
            </p>
            <p className="text-lg text-muted-foreground mt-4 pt-4 border-t border-border">
              💡 <strong className="text-foreground">Pro Tip:</strong> Earned Loyalty points can be transferred to fiat immediately!
            </p>
            <p className="text-lg text-muted-foreground">
              💡 <strong className="text-foreground">Remember:</strong> You can be both a buyer and a seller simultaneously, earning Loyalty from purchases while selling products!
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default LoyaltyExplained;
