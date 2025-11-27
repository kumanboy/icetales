import CarouselSection from "./_components/CarouselSection/CarouselSection";
import { CategoriesSection } from "./_components/CategoriesSection/CategoriesSection";
import { Footer } from "./_components/Footer/Footer";
import { Header } from "./_components/Header/Header";
import { HeroBanner } from "./_components/HeroBanner/HeroBanner";
import { NewsletterSignup } from "./_components/NewsletterSignup/NewsletterSignup";



export default function Home() {
  return (
    <>
      <div className="homepage">
        <Header />
        <HeroBanner />
        <main className="min-h-screen bg-white">
          <CarouselSection />
          <CategoriesSection />
          <NewsletterSignup />
        </main>
        <Footer />
      </div>
    </>
  );
}
