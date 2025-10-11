import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Order, User } from "@/types";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Package, User as UserIcon, Phone, Mail, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WithdrawModal from "@/components/WithdrawModal";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    fetchOrderDetail();
  }, [id, navigate]);

  const fetchOrderDetail = async () => {
    try {
      const data = await api.getOrder(Number(id));
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    setIsConfirming(true);
    try {
      const response = await api.confirmDelivery(order.id);
      toast({
        title: "Delivery Confirmed!",
        description: response.message,
      });
      fetchOrderDetail();
    } catch (error: any) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "Failed",
        description: error.message || "Failed to confirm delivery",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCanceling(true);
    try {
      const response = await api.cancelOrder(order.id);
      toast({
        title: "Order Canceled",
        description: response.message,
      });
      fetchOrderDetail();
    } catch (error: any) {
      console.error("Error canceling order:", error);
      toast({
        title: "Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, text: "Pending Payment" },
      ESCROWED: { variant: "default" as const, icon: Package, text: "In Transit" },
      COMPLETED: { variant: "default" as const, icon: CheckCircle, text: "Completed" },
      CANCELED: { variant: "destructive" as const, icon: XCircle, text: "Canceled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-sm py-1 px-3">
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </Badge>
    );
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <Button onClick={() => navigate("/orders")}>
              Back to Orders
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isBuyer = currentUser && order.buyer_id === currentUser.id;
  const isSeller = currentUser && order.seller_id === currentUser.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Order Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Order #{order.id}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Product Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product ID:</span>
                          <span className="font-medium">#{order.product_id}</span>
                        </div>
                        {order.product_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Product Name:</span>
                            <span className="font-medium">{order.product_name}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total Price:</span>
                          <span className="text-primary">₦{order.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {isBuyer && (
                          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold text-muted-foreground">Seller Details</p>
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Seller ID: {order.seller_id}</span>
                            </div>
                          </div>
                        )}
                        
                        {isSeller && (
                          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold text-muted-foreground">Buyer Details</p>
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Buyer ID: {order.buyer_id}</span>
                            </div>
                          </div>
                        )}
                      </div>
                           <div className="grid md:grid-cols-2 gap-4">
              
                
              
                </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                {isBuyer && order.status === "PENDING" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Buyer Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={handleConfirmDelivery}
                        disabled={isConfirming}
                        className="w-full"
                        size="lg"
                      >
                        {isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Delivery
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Confirming delivery will release funds to the seller and reward you with Blocks
                      </p>
                    </CardContent>
                  </Card>
                )}

                {isBuyer && order.status === "PENDING" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleCancelOrder}
                        disabled={isCanceling}
                        variant="destructive"
                        className="w-full"
                        size="lg"
                      >
                        {isCanceling ? (
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
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 ${order.status !== 'CANCELED' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status !== 'CANCELED' ? 'bg-primary text-white' : 'bg-muted'}`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Order Placed</p>
                          <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 ${order.status === 'PENDING' || order.status === 'COMPLETED' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'PENDING' || order.status === 'COMPLETED' ? 'bg-primary text-white' : 'bg-muted'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">In Transit</p>
                          <p className="text-xs text-muted-foreground">Funds PENDING</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 ${order.status === 'COMPLETED' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'COMPLETED' ? 'bg-primary text-white' : 'bg-muted'}`}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Completed</p>
                          <p className="text-xs text-muted-foreground">Order fulfilled</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isBuyer && order.status === "COMPLETED" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Withdraw Funds</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setShowWithdrawModal(true)}
                        variant="default"
                        className="w-full"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Withdraw to Bank
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
};

export default OrderDetail;
