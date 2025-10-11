export type UserType = 'individual' | 'venture' | 'company';

export interface User {
  id: number;
  name: string;
  phone: string;
  user_type: UserType;
  block_balance: string;
  fiat_balance: string;
  referral_code?: string;
}

export interface Wallet {
  user_id: number;
  name: string;
  block_balance: string;
  fiat_balance: string;
  created_at: string;
  total_mined?: string;
  last_updated?: string;
  paystack_bank_name: string;
  paystack_dedicated_account: string;

}

export interface LedgerEntry {
  id?: number;
  change: string;
  balance_after: string;
  reason: string;
  timestamp: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  seller_id: number;
  seller_name: string;
  category: string;
  subcategory: string;
  image_url?: string;
}

export interface Order {
  id: number;
  product_id: number;
  product_name?: string;
  buyer_id: number;
  seller_id: number;
  total_price: number;
  status: 'PENDING' | 'ESCROWED' | 'COMPLETED' | 'CANCELED';
  created_at: string;
}

export interface Transaction {
  id: number;
  amount: string;
  status: string;
  created_at: string;
  seller_id?: number;
  buyer_id?: number;
  type: 'purchase' | 'sale';
}

export interface ExchangeListing {
  id: number;
  seller_id: number;
  seller_name: string;
  quantity: string;
  price_per_unit: string;
  total_price: string;
  status: 'active' | 'sold';
}

export interface Referral {
  referred_user_id: number;
  referred_user_name: string;
  rewarded: boolean;
  created_at: string;
}

export interface Category {
  name: string;
  subcategories: string[];
}

export interface Notification {
  id: number;
  user_id: number;
  sender_id?: number;
  type: string;
  content?: string;
  is_read: boolean;
  timestamp: string;
  sender?: {
    id: number;
    name: string;
  };
}

export interface Bank {
  code: string;
  name: string;
}

export const INITIAL_BLOCKS: Record<UserType, number> = {
  individual: 100000,
  venture: 500000,
  company: 1000000,
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
  individual: 'Individual',
  venture: 'Business Name (CAC)',
  company: 'Company (CAC)',
};
