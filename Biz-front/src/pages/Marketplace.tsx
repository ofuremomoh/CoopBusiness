import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          api.getCategories(),
          api.getProducts(selectedCategory !== "all" ? selectedCategory : undefined),
        ]);
        setCategories(categoriesData.categories);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Browse products and earn 20% Block rewards on every purchase
            </p>

            <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-64">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const price = parseFloat(product.price);
                const blockReward = price * 0.2;

                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                                 {product.image_url ? (
                  <img
      src={product.image_url ?? undefined}
      alt={product.title}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement!.innerHTML = '<div class="text-8xl">📦</div>';
      }}
    />

              ) : (
                <div className="text-8xl">📦</div>
              )}

                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {product.subcategory}
                        </Badge>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ₦{price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Earn ₦{blockReward.toLocaleString()} Blocks
                          </p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => window.location.href = `/product/${product.id}`}
                      >
                        View Details
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Sold by {product.seller_name}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
