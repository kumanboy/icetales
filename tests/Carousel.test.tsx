import { render, screen } from "@testing-library/react";
import Carousel from "@/app/_components/CarouselSection/Carousel";
import { products } from "@/app/_data/products";
import { CartProvider } from "@/app/_context/CartContext";

jest.mock("react-slick", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-slider">{children}</div>
  ),
}));

describe("Carousel", () => {
  const renderCarousel = () =>
    render(
      <CartProvider>
        <Carousel />
      </CartProvider>
    );

  it("renders the slider container", () => {
    renderCarousel();

    expect(screen.getByTestId("mock-slider")).toBeInTheDocument();
  });

  it("renders a ProductCard for every product", () => {
    renderCarousel();

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(products.length);
  });
});
