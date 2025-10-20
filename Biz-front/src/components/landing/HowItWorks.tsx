import { Card } from "@/components/ui/card";
import { UserPlus, ShoppingCart, Coins, Award } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Get Loyalty",
    description: "Sign up and receive initial Loyalty allocation (₦100k for individuals, ₦500k for ventures, ₦1M for companies). This is your selling power!",
    color: "primary",
  },
  {
    icon: ShoppingCart,
    title: "Buy & Earn Rewards",
    description: "Purchase products from sellers and automatically earn 20% of the purchase value in Loyalty. 10% comes from the seller, 10% is newly mined.",
    color: "secondary",
  },
  {
    icon: Coins,
    title: "Sell Products",
    description: "List products at up to 10x your Loyalty balance. When buyers purchase, you receive full payment while 10% of your Loyalty transfers to buyers.",
    color: "accent",
  },
  {
    icon: Award,
    title: "Transfer to Cash",
    description: "All earned Loyalty (from purchases and mining) can be transferred to your fiat wallet immediately!",
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

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-center">Important: Understanding Your Initial Loyalty</h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-center text-lg">
                Your initial Loyalty allocation is your <strong className="text-foreground">selling power</strong>, not cash. 
                You can use it to create sales up to 10x its value.
              </p>
              <p className="text-center text-lg">
                <strong className="text-foreground">Good news:</strong> All Loyalty you earn from purchases can be transferred to cash immediately! 
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
