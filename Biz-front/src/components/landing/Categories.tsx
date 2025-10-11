import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Coffee, Shirt, Laptop, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Intermediate",
    icon: Package,
    description: "Building materials, metals, plastics, and more",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Consumables",
    icon: Coffee,
    description: "Daily essentials, papers, and household items",
    gradient: "from-green-500 to-green-600",
  },
  {
    name: "Fashion",
    icon: Shirt,
    description: "Fabrics, textiles, and leather products",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Technology",
    icon: Laptop,
    description: "Electronics, computers, and tech accessories",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Services",
    icon: Wrench,
    description: "Professional and business services",
    gradient: "from-orange-500 to-orange-600",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through our diverse categories and start earning Block rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50"
                onClick={() => navigate(`/marketplace?category=${category.name.toLowerCase()}`)}
              >
                <div className={`h-32 bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                    Browse Category
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
