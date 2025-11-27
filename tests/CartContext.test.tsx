import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart, type Product } from "@/app/_context/CartContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleProduct: Product = {
  id: "test-product",
  name: "Test Product",
  description: "Sample description",
  price: 10,
  imageUrl: "/test.png",
  rating: 5,
};

describe("CartContext", () => {
  it("adds a product to the cart and increments quantity for duplicates", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(sampleProduct));
    act(() => result.current.addToCart(sampleProduct));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      product: sampleProduct,
      quantity: 2,
    });
  });

  it("removes items and drops them when quantity reaches zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.addToCart(sampleProduct);
    });

    act(() => result.current.removeFromCart(sampleProduct.id));
    expect(result.current.items[0].quantity).toBe(1);

    act(() => result.current.removeFromCart(sampleProduct.id));
    expect(result.current.items).toHaveLength(0);
  });

  it("clears the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });
});
