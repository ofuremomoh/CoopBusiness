import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, CheckCircle2, XCircle, Clock, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.getMyOrders();
      setOrders(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const response = await api.confirmDelivery(orderId);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Delivery Confirmed!",
          description: `You earned ${response.buyer_bonus_block} Blocks!`,
        });
        fetchOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const response = await api.cancelOrder(orderId);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Canceled",
          description: "Your order has been canceled successfully.",
        });
        fetchOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "outline",
      ESCROWED: "secondary",
      COMPLETED: "default",
      CANCELED: "destructive",
    };

    const icons = {
      PENDING: Clock,
      ESCROWED: Package,
      COMPLETED: CheckCircle2,
      CANCELED: XCircle,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const buyerOrders = orders.filter(order => order.buyer_id === currentUserId);
  const sellerOrders = orders.filter(order => order.seller_id === currentUserId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              Track your purchases and sales
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/marketplace")}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Buyer Orders Section */}
              {buyerOrders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    My Purchases
                  </h2>
                  <div className="space-y-4">
                    {buyerOrders.map((order) => (
                      <Card 
                        key={order.id} 
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                {order.product_name || `Order #${order.id}`}
                              </CardTitle>
                              <CardDescription>
                                Order ID: {order.id} • {new Date(order.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Price</p>
                              <p className="text-lg font-semibold">
                                ₦{order.total_price.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="text-lg font-semibold capitalize">
                                {order.status.toLowerCase()}
                              </p>
                            </div>
                          </div>

                          {order.status === "ESCROWED" && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                onClick={() => handleConfirmDelivery(order.id)}
                                disabled={actionLoading === order.id}
                                className="flex-1"
                              >
                                {actionLoading === order.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Confirm Delivery
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {order.status === "PENDING" && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Canceling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {order.status === "COMPLETED" && (
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <p className="text-sm text-muted-foreground">
                                ✅ Order completed! You earned 10% Loyalty rewards on this purchase.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Orders Section */}
              {sellerOrders.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    My Sales
                  </h2>
                  <div className="space-y-4">
                    {sellerOrders.map((order) => (
                      <Card 
                        key={order.id} 
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                {order.product_name || `Order #${order.id}`}
                              </CardTitle>
                              <CardDescription>
                                Order ID: {order.id} • {new Date(order.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Price</p>
                              <p className="text-lg font-semibold">
                                ₦{order.total_price.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="text-lg font-semibold capitalize">
                                {order.status.toLowerCase()}
                              </p>
                            </div>
                          </div>

                          {order.status === "COMPLETED" && (
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <p className="text-sm text-muted-foreground">
                                ✅ Sale completed successfully!
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
