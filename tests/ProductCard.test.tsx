import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/app/_components/ProductCard/ProductCard";
import type { Product } from "@/app/_context/CartContext";

const mockAddToCart = jest.fn();

jest.mock("@/app/_context/CartContext", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
  }),
}));

jest.mock("next/image", () => (props: any) => <img {...props} />);

const sampleProduct: Product = {
  id: "sample",
  name: "Sample Sundae",
  description: "Tasty treat",
  price: 4.5,
  imageUrl: "/sample.png",
  rating: 4.8,
};

describe("ProductCard", () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it("renders product information", () => {
    render(<ProductCard product={sampleProduct} />);

    expect(screen.getByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.description)).toBeInTheDocument();
    expect(screen.getByText(`$${sampleProduct.price.toFixed(2)}`)).toBeInTheDocument();
  });

  it("adds the item to cart when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={sampleProduct} />);

    const addButton = screen.getAllByRole("button")[1]; // second button is add-to-cart
    await user.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledWith(sampleProduct);
  });
});
