const API_BASE = "/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // ==================== AUTH ROUTES ====================
  async register(data: {
    name: string;
    phone: string;
    password: string;
    user_type: string;
    referral_code?: string;
    email: string;
  }) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw { status: response.status, message: responseData?.error || "Registration failed" };
    }

    return responseData;
  },

  async login(data: { phone: string; password: string }) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw { status: response.status, message: responseData?.error || "Login failed" };
    }

    return responseData;
  },

  // ==================== WALLET ROUTES ====================
  async getWallet() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/wallet`, { headers });

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

  async getLedger() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/wallet/ledger`, { headers });

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

  async transferLoyaltyToFiat(amount: number) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/wallet/transfer_loyalty_to_fiat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ amount }),
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

    const response = await fetch(`${API_BASE}/product/add`, {
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

    const url = category ? `${API_BASE}/product/list?category=${category}` : `${API_BASE}/product/list`;
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
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/product/${productId}`, { headers });

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

  // ==================== ORDER ROUTES ====================
  async getMyOrders() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/product/orders/mine`, { headers });

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

    const response = await fetch(`${API_BASE}/product/orders/${orderId}`, { headers });

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

    const response = await fetch(`${API_BASE}/product/orders/create`, {
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

    const response = await fetch(`${API_BASE}/product/orders/${orderId}/payment_confirmed`, {
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

    const response = await fetch(`${API_BASE}/product/orders/${orderId}/confirm_delivery`, {
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

    const response = await fetch(`${API_BASE}/product/orders/${orderId}/cancel`, {
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

  async refundOrder(orderId: number) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/product/orders/${orderId}/refund`, {
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

  // ==================== REFERRAL ROUTES ====================
  async getReferrals() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/referrals`, { headers });

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

  // ==================== NOTIFICATION ROUTES ====================
  async getNotifications() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/notifications`, { headers });

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

  async markNotificationRead(notificationId: number) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
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

  // ==================== TRANSACTION ROUTES ====================
  async getTransactions() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/transactions`, { headers });

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

  // ==================== SETTINGS ROUTES ====================
  async updateContactInfo(data: {
    settingsAddress: string;
    settingsPhoneNumber: string;
    settingsEmailAddress: string;
  }) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/update_contact_info`, {
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

  // ==================== PAYSTACK ROUTES ====================
  async getBanks() {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/paystack/banks`, { headers });

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

  async verifyAccount(data: { bank_code: string; account_number: string }) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/verify_account`, {
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

  async withdraw(data: {
    bank_code: string;
    account_number: string;
    amount: number;
    password: string;
  }) {
    console.log("🧠 Local token:", localStorage.getItem("token"));
    const headers = authHeaders();
    console.log("🚀 Final headers sent:", headers);

    const response = await fetch(`${API_BASE}/paystack/withdraw`, {
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
};
