import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Transaction } from "@/types";
import { ArrowUpRight, ArrowDownRight, Loader2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setPurchases(data.purchases || []);
      setSales(data.sales || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const renderTransactionCard = (transaction: Transaction, isSale: boolean) => {
    const amount = parseFloat(transaction.amount);
    
    return (
      <Card key={transaction.id} className="hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSale ? 'bg-green-500/10' : 'bg-blue-500/10'
                }`}>
                  {isSale ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {isSale ? 'Sale' : 'Purchase'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: #{transaction.id}
                  </p>
                </div>
              </div>
              
              <div className="ml-13 space-y-1">
                {isSale && transaction.buyer_id && (
                  <p className="text-sm text-muted-foreground">
                    Buyer ID: {transaction.buyer_id}
                  </p>
                )}
                {!isSale && transaction.seller_id && (
                  <p className="text-sm text-muted-foreground">
                    Seller ID: {transaction.seller_id}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                isSale ? 'text-green-600' : 'text-blue-600'
              }`}>
                {isSale ? '+' : '-'}₦{amount.toLocaleString()}
              </p>
              <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Transactions</h1>
                <p className="text-muted-foreground">
                  View your purchase and sale history
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Receipt className="w-8 h-8 text-white" />
              </div>
            </div>

            <Tabs defaultValue="purchases" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchases">
                  Purchases ({purchases.length})
                </TabsTrigger>
                <TabsTrigger value="sales">
                  Sales ({sales.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="purchases" className="space-y-4">
                {purchases.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
                      <p className="text-muted-foreground">
                        Your purchase history will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  purchases.map((transaction) => renderTransactionCard(transaction, false))
                )}
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                {sales.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No sales yet</h3>
                      <p className="text-muted-foreground">
                        Your sales history will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  sales.map((transaction) => renderTransactionCard(transaction, true))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Transactions;
