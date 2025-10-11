import { Card } from "@/components/ui/card";
import { ShoppingBag, Store, ArrowUpDown } from "lucide-react";

const BlockExplained = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Understanding Blocks for Buyers & Sellers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            You can be both a buyer and a seller on our platform. Here's how Blocks work for each role:
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
                <h4 className="font-semibold text-lg mb-2">What Blocks Mean to You:</h4>
                <p className="text-muted-foreground">
                  Your initial Block allocation (₦100k-₦1M) is your <strong className="text-foreground">selling power</strong> if you decide to sell products. 
                  As a buyer, you earn 20% Block value on every purchase.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Trading Blocks for Cash:</h4>
                <p className="text-muted-foreground">
                  Your <strong className="text-foreground">initial Block allocation</strong> (₦100k-₦1M) can only be traded once you've made purchases worth 10x that amount. 
                  However, <strong className="text-foreground">all earned Blocks</strong> (from purchases and mining) can be traded for cash immediately! 
                  When you sell, Blocks are <strong className="text-foreground">debited from your Block account</strong> and you receive fiat (minus 20% platform fee).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Buying More Blocks:</h4>
                <p className="text-muted-foreground">
                  Purchase Blocks from other users with fiat. The Blocks are <strong className="text-foreground">credited to your Block account</strong>, 
                  increasing your ability to sell products (up to 10x your new Block balance).
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
                <h4 className="font-semibold text-lg mb-2">What Blocks Mean to You:</h4>
                <p className="text-muted-foreground">
                  Your Block balance determines your sales capacity. You can list products worth up to <strong className="text-foreground">10x your Block balance</strong>. 
                  When someone buys from you, 10% of your Blocks transfer to the buyer.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Boosting Sales with Blocks:</h4>
                <p className="text-muted-foreground">
                  To increase sales capacity, buy Blocks from the marketplace. The purchased Blocks are <strong className="text-foreground">credited to your account</strong>, 
                  instantly multiplying your selling power by 10x the new balance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Replenishing Blocks:</h4>
                <p className="text-muted-foreground">
                  As you sell, your Blocks decrease. To maintain high sales volume, either buy products from others (earn Blocks) 
                  or purchase Blocks directly from the marketplace with fiat.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ArrowUpDown className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-bold text-center">Block Marketplace Transactions</h3>
          </div>
          <div className="space-y-3 text-center">
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">Selling Blocks:</strong> Your Block account is debited, and you receive fiat (80% after platform fee)
            </p>
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">Buying Blocks:</strong> Your Block account is credited with purchased Blocks, and fiat is deducted
            </p>
            <p className="text-lg text-muted-foreground mt-4 pt-4 border-t border-border">
              💡 <strong className="text-foreground">Pro Tip:</strong> Earned Blocks can be traded immediately! Only your initial allocation requires 10x purchases to unlock.
            </p>
            <p className="text-lg text-muted-foreground">
              💡 <strong className="text-foreground">Remember:</strong> You can be both a buyer and a seller simultaneously, earning Blocks from purchases while selling products!
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BlockExplained;
