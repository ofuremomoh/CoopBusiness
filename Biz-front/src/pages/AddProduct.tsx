import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Category } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddProduct = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageType, setImageType] = useState<"url" | "upload">("url");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    image_url: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }



    const fetchCategories = async () => {
      // Hardcoded categories
      setCategories([
          {
    name: 'Raw Materials',
    subcategories: [
      'Agricultural Produce',
      'Minerals & Natural Stones',
      'Chemicals & Dyes',
      'Industrial Oils & Lubricants',
      'Scraps & Recyclables'
    ]
  },
    {
    name: 'Intermediate Goods',
    subcategories: [
      'Building Materials',
      'Metals & Alloys',
      'Rubber & Plastic Components',
      'Wood & Furniture Parts',
      'Textile & Leather Materials',
      'Electrical Components',
      'Machined Parts & Tools'
    ]
  },

  {
    name: 'Technology & Equipment',
    subcategories: [
      'Fabrication Machines',
      'Industrial Tools',
      'Electronics & Circuit Boards',
      'Engines & Motors',
      'Power & Energy Equipment',
      'ICT Devices & Peripherals',
      'Automation & Robotics',
      'Repair Tools & Accessories'
    ]
  },
  {
    name: 'Consumables',
    subcategories: [
      'Kitchen & Food Supplies',
      'Toiletries & Sanitation',
      'Paper & Stationery',
      'Beauty & Personal Care',
      'Plastic & Packaging Materials',
      'Home & Living Essentials',
      'Healthcare & Sanitary Products',
      'Others'
    ]
  },
   {
    name: 'Supplies',
    subcategories: [
      'Office Supplies',
      'School Supplies',
      'Workshop & Craft Supplies',
      'Agricultural Supplies',
      'Industrial Maintenance Items'
    ]
  },
    {
    name: 'Fashion & Clothing',
    subcategories: [
      'Equipment & Sewing Tools',
      'Fabrics & Materials',
      'Footwear & Leatherworks',
      'Accessories & Ornaments',
      'Ready-to-Wear Items'
    ]
  },

    {
    name: 'Services',
    subcategories: [
      'Fabrication & Repair',
      'Printing & Packaging',
      'Delivery & Logistics',
      'Design & Branding',
      'Installation & Maintenance',
      'Training & Consultancy'
    ]
  }
      ]);
    };

    fetchCategories();
  }, [navigate]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.name === selectedCategory);
      setSubcategories(category?.subcategories || []);
      setFormData((prev) => ({ ...prev, category: selectedCategory, subcategory: "" }));
    }
  }, [selectedCategory, categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 or upload to a service
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive",
        });
        return;
      }

      await api.addProduct({
        title: formData.title,
        description: formData.description,
        price,
        category: formData.category,
        subcategory: formData.subcategory,
        image_url: formData.image_url,
      });

      toast({
        title: "Success!",
        description: "Product listed successfully",
      });

      navigate("/marketplace");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Plus className="w-10 h-10" />
                Add New Product
              </h1>
              <p className="text-muted-foreground">
                List your product and start selling with Block rewards
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe your product in detail"
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="Enter price in Naira"
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum listing value: 10x your Loyalty balance
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory *</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subcategory: value }))
                      }
                      disabled={!selectedCategory}
                    >
                      <SelectTrigger id="subcategory">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Product Image *</Label>
                  <Tabs value={imageType} onValueChange={(v) => setImageType(v as "url" | "upload")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Image URL
                      </TabsTrigger>
                      <TabsTrigger value="upload">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Image
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="mt-4">
                      <Input
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                        }
                        placeholder="https://example.com/image.jpg"
                        type="url"
                      />
                    </TabsContent>

                    <TabsContent value="upload" className="mt-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload an image file (JPG, PNG, WEBP)
                      </p>
                    </TabsContent>
                  </Tabs>

                  {formData.image_url && (
                    <div className="mt-4">
                      <Label>Preview:</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden max-w-md">
                        <img
                          src={formData.image_url}
                          alt="Product preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding Product..." : "List Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/marketplace")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProduct;
