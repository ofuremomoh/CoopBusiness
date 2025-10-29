import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Wallet, LedgerEntry, INITIAL_LOYALTY } from "@/types";
import { Wallet as WalletIcon, TrendingUp, History, Plus, ShoppingBag, Gift, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [walletData, ledgerData] = await Promise.all([
          api.getWallet(),
          api.getLedger(),
        ]);
        setWallet(walletData);
        setLedger(ledgerData.ledger);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-xl mb-4">No wallet found</p>
            <Button onClick={() => navigate("/register")}>Register Now</Button>
          </Card>
        </div>
      </div>
    );
  }

  const loyaltyBalance = parseFloat(wallet.loyalty_balance);
  const fiatBalance = parseFloat(wallet.fiat_balance);
  const maxSalesPower = loyaltyBalance * 10;

  const handleTransferToFiat = async () => {
    if (!loyaltyBalance || loyaltyBalance <= 0) {
      toast({
        title: "Error",
        description: "No loyalty balance to transfer",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.transferLoyaltyToFiat(loyaltyBalance);
      const walletData = await api.getWallet();
      setWallet(walletData);
      toast({
        title: "Success",
        description: `Transferred ₦${loyaltyBalance.toLocaleString()} to your fiat wallet`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transfer loyalty balance",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {wallet.name}!</h1>
          </div>

          {/* Wallet Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline">Loyalty Balance</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">
                  ₦{loyaltyBalance.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Available Loyalty Points
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={handleTransferToFiat}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Transfer to Fiat
                </Button>
              </div>
            </Card>


            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-accent" />
                </div>
                <Badge variant="outline">Naira Balance</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">
                  ₦{fiatBalance.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Available cash
                </p>
                {wallet.paystack_dedicated_account && (
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">Fund your wallet via:</p>
                    <p className="text-sm font-semibold">{wallet.paystack_bank_name}</p>
                    <p className="text-sm font-mono">{wallet.paystack_dedicated_account}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-5 gap-4">
              <Button 
                variant="default" 
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/add-product")}
              >
                <Plus className="w-6 h-6 mb-2" />
                <span>Add Product</span>
              </Button>

              <Button 
                variant="secondary" 
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/marketplace")}
              >
                <ShoppingBag className="w-6 h-6 mb-2" />
                <span>Browse Marketplace</span>
              </Button>
              
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/transactions")}
              >
                <History className="w-6 h-6 mb-2" />
                <span>Transactions</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="w-6 h-6 mb-2" />
                <span>My Orders</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/referrals")}
              >
                <Gift className="w-6 h-6 mb-2" />
                <span>Referrals</span>
              </Button>
            </div>
          </Card>

          {/* Transaction Ledger */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <History className="w-5 h-5" />
              Loyalty Transaction History
            </h2>
            
            {ledger.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Start buying or selling to see your history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ledger.map((entry, index) => {
                  const change = parseFloat(entry.change);
                  const balanceAfter = parseFloat(entry.balance_after);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{entry.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${change > 0 ? 'text-secondary' : 'text-destructive'}`}>
                        {change > 0 ? '+' : ''}₦{change.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
