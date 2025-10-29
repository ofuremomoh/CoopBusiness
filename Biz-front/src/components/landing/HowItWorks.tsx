import { Card } from "@/components/ui/card";
import { UserPlus, ShoppingCart, Coins, Award } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Get Loyalty Wallet",
    description: "Get loyalty rewards on purchases you make and pay loyalty to your buyers from your loyalty wallet. Make sure your loyalty wallet is funded for the amount of sales you wish to make.",
    color: "primary",
  },
  {
    icon: ShoppingCart,
    title: "Cash Transactions",
    description: "Cash transactions occur when a buyer pays from his designated bank account for items on the marketplace. ",
    color: "secondary",
  },
  {
    icon: Coins,
    title: "Loyalty Transactions",
    description: "Buyers can make purchases with their loyalty wallet to the seller's account.",
    color: "accent",
  },
  {
    icon: Award,
    title: "Seller Remittances",
    description: "for cash transactions, seller gets 100% of the sales value into his bank account having paid 10% into buyer's wallet. While for loyalty transactions, seller gets 50% of the value into his bank account and 50% into his loyalty account and pays no loyalty fee.",
    color: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How Coop Business Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple system that rewards buyers and empowers sellers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-${step.color}/10 flex items-center justify-center mb-4 mt-2`}>
                  <Icon className={`w-7 h-7 text-${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
