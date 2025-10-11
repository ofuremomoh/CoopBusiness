const API_BASE_URL = '';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const clearToken = () => localStorage.removeItem('token');

// Auth headers helper
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const api = {
  // ==================== AUTH ROUTES ====================
  async register(data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    user_type: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async login(data: { phone: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },

  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify_token`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  logout() {
    clearToken();
  },

  // ==================== WALLET ROUTES ====================
async getWallet() {
  console.log("🧠 Local token:", localStorage.getItem("token"));

const headers = authHeaders();
console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/wallet`, {
    headers: authHeaders(),
  });


  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: data?.error || "Request failed" };
  }

  return data;
}
,

  async depositFiat(amount: number) {
    const response = await fetch(`${API_BASE_URL}/api/wallet/deposit_fiat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    return response.json();
  },

  async withdrawFiat(amount: number) {
    const response = await fetch(`${API_BASE_URL}/api/wallet/withdraw_fiat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    return response.json();
  },

  async getLedger() {
    const response = await fetch(`${API_BASE_URL}/api/wallet/ledger`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  // ==================== LEDGER ROUTES ====================
  async getLedgerWallet() {
    const response = await fetch(`${API_BASE_URL}/api/ledger/wallet`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  async getLedgerHistory(type?: string) {
    const url = type 
      ? `${API_BASE_URL}/api/ledger/history?type=${type}`
      : `${API_BASE_URL}/api/ledger/history`;
    const response = await fetch(url, {
      headers: authHeaders(),
    });
    return response.json();
  },

  async getTransactions() {
    const response = await fetch(`${API_BASE_URL}/api/ledger/transactions`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  async filterLedger(start: string, end: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/ledger/filter?start=${start}&end=${end}`,
      { headers: authHeaders() }
    );
    return response.json();
  },

  // ==================== PRODUCT ROUTES ====================
async addProduct(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  image_url?: string;
}) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/add`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async getProducts(category?: string) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const url = category ? `/api/product/list?category=${category}` : `/api/product/list`;
  const response = await fetch(url, { headers });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async getProduct(productId: number) {
  const response = await fetch(`/api/product/${productId}`);
  
  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async getMyOrders() {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/mine`, { headers });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async getOrder(orderId: number) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/${orderId}`, { headers });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async createOrder(data: { product_id: number; quantity: number }) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async confirmPayment(orderId: number, paymentReference: string) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/${orderId}/payment_confirmed`, {
    method: "POST",
    headers,
    body: JSON.stringify({ payment_reference: paymentReference }),
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async confirmDelivery(orderId: number) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/${orderId}/confirm_delivery`, {
    method: "POST",
    headers,
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async cancelOrder(orderId: number) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/product/orders/${orderId}/cancel`, {
    method: "POST",
    headers,
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},


  // ==================== EXCHANGE ROUTES ====================
async listBlocks(data: { quantity: number; price_per_unit: number }) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/exchange/list`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},


async getExchangeListings() {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/exchange/listings`, { headers });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  console.log("📦 API Response Data:", responseData); // <— Add this line

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

async buyBlocks(listingId: number) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/exchange/buy`, {
    method: "POST",
    headers,
    body: JSON.stringify({ listing_id: listingId }),
  });

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: responseData?.error || "Request failed" };
  }

  return responseData;
},

  // ==================== REFERRAL ROUTES ====================
async generateReferralCode() {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/wallet/generate`, {
    method: "POST",
    headers,
  });

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: data?.error || "Request failed" };
  }

  return data;
},

async applyReferralCode(referralCode: string) {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/wallet/apply`, {
    method: "POST",
    headers,
    body: JSON.stringify({ referral_code: referralCode }),
  });

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: data?.error || "Request failed" };
  }

  return data;
},

async getMyReferrals() {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/wallet/my_referrals`, { headers });

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: data?.error || "Request failed" };
  }

  return data;
},

async getReferralRewards() {
  console.log("🧠 Local token:", localStorage.getItem("token"));
  const headers = authHeaders();
  console.log("🚀 Final headers sent:", headers);

  const response = await fetch(`/api/wallet/rewards`, { headers });

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text.substring(0, 80)}...`);
  }

  if (!response.ok) {
    throw { status: response.status, message: data?.error || "Request failed" };
  }

  return data;
},


  // ==================== CATEGORIES (PUBLIC) ====================
  async getCategories() {
    // For now, return hardcoded categories since backend seeding is admin-only
    return {
      categories: [
        {
          name: 'Electronics',
          subcategories: ['Phones', 'Laptops', 'Accessories', 'Wearables']
        },
        {
          name: 'Fashion',
          subcategories: ['Clothing', 'Shoes', 'Accessories', 'Bags']
        },
        {
          name: 'Home & Living',
          subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding']
        },
        {
          name: 'Beauty',
          subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrances']
        },
        {
          name: 'Sports',
          subcategories: ['Equipment', 'Apparel', 'Footwear', 'Accessories']
        },
        {
          name: 'Books',
          subcategories: ['Fiction', 'Non-fiction', 'Educational', 'Comics']
        }
      ]
    };
  },

  // ==================== NOTIFICATIONS ====================
  async getNotifications() {
    const headers = authHeaders();
    const response = await fetch(`/api/notifications`, { headers });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data?.error || "Request failed" };
    return data;
  },

  async markNotificationRead(notificationId: number) {
    const headers = authHeaders();
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "POST",
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data?.error || "Request failed" };
    return data;
  },

  // ==================== SETTINGS ====================
  async updateContactInfo(data: {
    settingsAddress: string;
    settingsPhoneNumber: string;
    settingsEmailAddress: string;
  }) {
    const headers = authHeaders();
    const response = await fetch(`/api/update_contact_info`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw { status: response.status, message: result?.message || "Request failed" };
    return result;
  },

  // ==================== PAYSTACK WITHDRAW ====================
  async getBanks() {
    const headers = authHeaders();
    const response = await fetch(`/api/paystack/banks`, { headers });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data?.error || "Request failed" };
    return data;
  },

  async verifyAccount(bankCode: string, accountNumber: string) {
    const headers = authHeaders();
    const response = await fetch(`/api/verify_account`, {
      method: "POST",
      headers,
      body: JSON.stringify({ bank_code: bankCode, account_number: accountNumber }),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data?.error || "Request failed" };
    return data;
  },

  async withdraw(data: {
    bank_code: string;
    account_number: string;
    amount: number;
    password: string;
  }) {
    const headers = authHeaders();
    const response = await fetch(`/api/paystack/withdraw`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw { status: response.status, message: result?.error || "Request failed" };
    return result;
  },
};
