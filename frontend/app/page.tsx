import Footer from "./components/ui/Footer";
import Hero from "./components/ui/Hero";
import Prediction from "./components/ui/Prediction";

export default function Home() {
  return (
    <div className="text-on-background font-body selection:bg-primary selection:text-on-primary overflow-x-hidden">
      
      {/* Your content here */}

      {/* <Header /> */}

      <main className="relative pb-16">
        <Hero />

        <Prediction />
      </main>

      <Footer />
    </div>
  );
}
