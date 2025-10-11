import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ExchangeListing, Wallet } from "@/types";
import { ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Exchange = () => {

  
  const [listings, setListings] = useState<ExchangeListing[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [listingForm, setListingForm] = useState({
    quantity: "",
    price_per_unit: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
  console.log("🎯 Exchange page loaded — running fetchData()");
}, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("🚀 Calling api.getExchangeListings()");

        const [listingsData, walletData] = await Promise.all([
          api.getExchangeListings(),
          api.getWallet(),
        ]);
        setListings(listingsData);
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching exchange data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleListBlocks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    try {
      const response = await api.listBlocks({
        quantity: parseFloat(listingForm.quantity),
        price_per_unit: parseFloat(listingForm.price_per_unit),
      });

      if (response.error) {
        toast({
          title: "Listing Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Blocks Listed Successfully",
        description: `${listingForm.quantity} Blocks listed for sale`,
      });

      setShowListForm(false);
      setListingForm({ quantity: "", price_per_unit: "" });
      
      // Refresh listings
      const [newListings, newWallet] = await Promise.all([
        api.getExchangeListings(),
        api.getWallet(),
      ]);
      setListings(newListings);
      setWallet(newWallet);
    } catch (error) {
      toast({
        title: "Listing Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleBuyBlocks = async (listingId: number) => {
    if (!wallet) return;

    try {
      const response = await api.buyBlocks(listingId);

      if (response.error) {
        toast({
          title: "Purchase Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Fund your Wallet ",
        description: `You will receive ${response.blocks_transferred} Blocks`,
      });

      // Refresh data
      const [newListings, newWallet] = await Promise.all([
        api.getExchangeListings(),
        api.getWallet(),
      ]);
      setListings(newListings);
      setWallet(newWallet);
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const blockBalance = wallet ? parseFloat(wallet.block_balance) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <ArrowRightLeft className="w-10 h-10 text-primary" />
                Block Exchange
              </h1>
              <p className="text-xl text-muted-foreground">
                Trade Blocks for cash or buy Blocks to boost your sales power
              </p>
            </div>

            {wallet && (
              <Card className="p-6 mb-8 bg-secondary/5 border-secondary/20">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary mb-2">Trading Information</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your current Block balance: <strong className="text-foreground">₦{blockBalance.toLocaleString()}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Note: Initial allocation requires 10x purchase value to unlock. All earned Blocks are immediately tradeable!
                    </p>
                  </div>
                </div>
                
                {!showListForm ? (
                  <Button onClick={() => setShowListForm(true)} variant="secondary">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    List Blocks for Sale
                  </Button>
                ) : (
                  <form onSubmit={handleListBlocks} className="space-y-4 border-t pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Block Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="50"
                          value={listingForm.quantity}
                          onChange={(e) => setListingForm({ ...listingForm, quantity: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price_per_unit">Price Per Unit (₦)</Label>
                        <Input
                          id="price_per_unit"
                          type="number"
                          placeholder="200"
                          value={listingForm.price_per_unit}
                          onChange={(e) => setListingForm({ ...listingForm, price_per_unit: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Total value: ₦{listingForm.quantity && listingForm.price_per_unit ? (parseFloat(listingForm.quantity) * parseFloat(listingForm.price_per_unit)).toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary">
                        Create Listing
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowListForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}

            <div>
              <h2 className="text-2xl font-semibold mb-6">Available Block Listings</h2>
              
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-48 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-xl text-muted-foreground mb-2">No listings available</p>
                  <p className="text-sm text-muted-foreground">Be the first to list your Blocks!</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => {
                    const quantity = parseFloat(listing.quantity);
                    const pricePerUnit = parseFloat(listing.price_per_unit);
                    const totalPrice = parseFloat(listing.total_price);

                    return (
                      <Card key={listing.id} className="p-6 hover:shadow-xl transition-all">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Badge variant="secondary">Listing #{listing.id}</Badge>
                            <Badge variant="outline" className="text-xs">
                              by {listing.seller_name}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="p-4 bg-primary/5 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                              <p className="text-2xl font-bold text-primary">
                                {quantity.toLocaleString()} Blocks
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                @ ₦{pricePerUnit.toLocaleString()} per unit
                              </p>
                            </div>

                            <div className="p-4 bg-secondary/5 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                              <p className="text-2xl font-bold text-secondary">
                                ₦{totalPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <Button 
                            className="w-full"
                            onClick={() => handleBuyBlocks(listing.id)}
                          >
                            Buy Blocks
                          </Button>
                                                    <Button 
                            className="w-full"
                          
                          >
                            Bid
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Exchange;
