import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Bank } from "@/types";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [formData, setFormData] = useState({
    bank_code: "",
    account_number: "",
    amount: "",
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-verify account when bank code and account number are complete
    if (formData.bank_code && formData.account_number.length === 10) {
      verifyAccount();
    } else {
      setAccountName("");
    }
  }, [formData.bank_code, formData.account_number]);

  const fetchBanks = async () => {
    try {
      const data = await api.getBanks();
      setBanks(data.banks || []);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast({
        title: "Error",
        description: "Failed to load banks",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const verifyAccount = async () => {
    setIsVerifying(true);
    try {
      const data = await api.verifyAccount({ 
        bank_code: formData.bank_code, 
        account_number: formData.account_number 
      });
      if (data.success) {
        setAccountName(data.account_name);
      } else {
        setAccountName("Invalid account");
        toast({
          title: "Verification Failed",
          description: "Could not verify account details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setAccountName("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName || accountName === "Invalid account" || accountName === "Verification failed") {
      toast({
        title: "Invalid Account",
        description: "Please enter valid account details",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.withdraw({
        ...formData,
        amount: parseInt(formData.amount),
      });

      toast({
        title: "Withdrawal Successful!",
        description: `₦${formData.amount} has been sent to ${accountName}`,
      });

      onClose();
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Transfer your funds to your bank account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            {isLoadingBanks ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select
                value={formData.bank_code}
                onValueChange={(value) => setFormData({ ...formData, bank_code: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Bank --" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              type="text"
              maxLength={10}
              placeholder="Enter 10-digit account number"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, "") })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Account Name</Label>
            <div className="relative">
              <Input
                type="text"
                value={accountName}
                readOnly
                placeholder={isVerifying ? "Verifying..." : "Account name will appear here"}
                className={accountName && accountName !== "Invalid account" ? "bg-green-50 border-green-200" : ""}
              />
              {accountName && accountName !== "Invalid account" && accountName !== "Verification failed" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter amount to withdraw"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !accountName || accountName === "Invalid account"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
