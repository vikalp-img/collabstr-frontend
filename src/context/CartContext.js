"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useUser } from "./UserContext";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiWithAuth.get(API_ENDPOINTS.CART);
      // Handle the nested structure: response.data.data.items
      const itemsData = response.data?.data;
      const items = Array.isArray(itemsData?.items) ? itemsData.items : (Array.isArray(itemsData) ? itemsData : []);

      if (Array.isArray(items)) {
        // Normalize items: map backend fields (title, creatorImage) to frontend names
        const normalized = items.map((item) => ({
          ...item,
          id: item._id || item.id || `${item.creatorId}-${item.title || item.serviceTitle}`,
          serviceTitle: item.title || item.serviceTitle,
          serviceDescription: item.description || item.serviceDescription,
          creatorAvatar: typeof (item.creatorImage || item.creatorAvatar) === 'string' && (item.creatorImage || item.creatorAvatar) 
            ? (item.creatorImage || item.creatorAvatar) 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.creatorName || "Creator")}`,
          // Ensure quantity is at least 1
          quantity: item.quantity || 1,
        }));
        setCartItems(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch cart from API", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state from API on mount AND when user session changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  // Fallback to localStorage if not logged in (for guest experience)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (!token) {
        try {
          const saved = localStorage.getItem("brandCart");
          if (saved) {
            setCartItems(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load cart from localStorage", e);
        }
      }
    }
  }, [user]); // Run when user session starts or ends

  // Update localStorage only for guests or as a backup
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("brandCart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback(
    async (item) => {
      // Check if this exact service from this exact creator is already in cart
      const existingIndex = cartItems.findIndex(
        (ci) =>
          ci.creatorId === item.creatorId &&
          ci.serviceTitle === item.serviceTitle &&
          ci.platform === item.platform,
      );

      if (existingIndex !== -1) {
        // Already in cart — locally increment for fast UI
        const updated = [...cartItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        setCartItems(updated);
        toast.success(`Updated quantity for "${item.serviceTitle}"`);
        return;
      }

      // New item locally for immediate feedback
      const newItem = {
        id: `${item.creatorId}-${item.serviceTitle}-${Date.now()}`,
        creatorId: item.creatorId,
        creatorName: item.creatorName,
        creatorAvatar: item.creatorAvatar,
        serviceTitle: item.serviceTitle,
        serviceDescription: item.serviceDescription,
        platform: item.platform,
        price: item.price,
        quantity: 1,
        addedAt: new Date().toISOString(),
      };

      setCartItems((prev) => [...prev, newItem]);
      toast.success(`"${item.serviceTitle}" added to cart!`);

      // Sync with API
      try {
        if (
          typeof window !== "undefined" &&
          localStorage.getItem("authToken")
        ) {
          const response = await apiWithAuth.post(API_ENDPOINTS.CART, {
            serviceId: item.serviceId || item.id,
          });

          if (response.data?.success === false) {
            throw new Error(response.data?.message || "Failed to add to cart");
          }

          // Sync IDs from backend after addition
          await fetchCart();
        }
      } catch (err) {
        console.error("API sync: Failed to add item to cart", err);
        toast.error(err.message || "Failed to sync cart with server");

        // Revert local state on failure
        setCartItems((prev) => prev.filter((ci) => ci.id !== newItem.id));
      }
    },
    [cartItems, fetchCart],
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      const itemToRemove = cartItems.find((ci) => ci.id === itemId);
      if (!itemToRemove) return;

      setCartItems((prev) => prev.filter((ci) => ci.id !== itemId));
      toast.info(`Removed "${itemToRemove.serviceTitle}" from cart`);

      // Sync with API
      try {
        if (
          typeof window !== "undefined" &&
          localStorage.getItem("authToken")
        ) {
          // Use backend id if it's different from local id
          const backendId = itemToRemove.backendId || itemToRemove.id;
          await apiWithAuth.delete(`${API_ENDPOINTS.CART}/${backendId}`);
        }
      } catch (err) {
        console.error("API sync: Failed to remove item from cart", err);
      }
    },
    [cartItems],
  );

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Save previous state for rollback
    const previousItems = [...cartItems];

    // Optimistic UI update
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.id === itemId ? { ...ci, quantity: newQuantity } : ci,
      ),
    );

    // Sync with API
    try {
      if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
        // itemId is expected to be the backend's cart item ID
        await apiWithAuth.patch(`${API_ENDPOINTS.CART}/${itemId}`, { 
          quantity: newQuantity 
        });
      }
    } catch (err) {
      console.error("API sync: Failed to update quantity", err);
      toast.error("Failed to update cart quantity");
      // Rollback on failure
      setCartItems(previousItems);
    }
  }, [cartItems]);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    toast.info("Cart cleared");

    // Sync with API
    try {
      if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
        await apiWithAuth.delete(API_ENDPOINTS.CART);
      }
    } catch (err) {
      console.error("API sync: Failed to clear cart", err);
    }
  }, []);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = useCallback(async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
        const response = await apiWithAuth.post(API_ENDPOINTS.ORDER.PLACE);
        
        if (response.data?.success) {
          setCartItems([]);
          localStorage.removeItem("brandCart");
          toast.success("Order placed successfully!");
          return response.data;
        } else {
          throw new Error(response.data?.message || "Failed to place order");
        }
      }
    } catch (err) {
      console.error("Failed to place order", err);
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong while placing your order";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isInCart = useCallback(
    (creatorId, serviceTitle, platform) => {
      return cartItems.some(
        (ci) =>
          ci.creatorId === creatorId &&
          ci.serviceTitle === serviceTitle &&
          ci.platform === platform,
      );
    },
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        loading,
        fetchCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
