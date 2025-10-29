import { Button } from "@/components/ui/button";
import { Blocks, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import marketplaceImg from "@/assets/logo.png"; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: "Marketplace", path: "/marketplace" },
    { label: "Add Product", path: "/add-product" },
    { label: "Notifications", path: "/notifications" },
    { label: "Track Driver", path: "/driver-tracking/1" },
    { label: "Driver Dashboard", path: "/driver-dashboard" },
    { label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
                      <img
                        src={marketplaceImg}
                        alt="Marketplace"
                        className="w-6 h-6 object-contain"
                      />
         
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Coop Mart
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
            <Button variant="default" size="sm" onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground/80 hover:text-primary font-medium transition-colors py-2"
              >
                {item.label}
              </button>
            ))}
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => {
                navigate("/register");
                setIsMenuOpen(false);
              }}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
