import { useLenis } from "./lib/useLenis";
import CustomCursor from "./components/CustomCursor";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import WorkGallery from "./components/WorkGallery";
import Stats from "./components/Stats";
import Services from "./components/Services";
import Founder from "./components/Founder";
import HappyClients from "./components/HappyClients";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  useLenis();

  return (
    <>
      <CustomCursor />
      <Header />
      <main className="bg-charcoal">
        <Hero />
        <About />
        <WorkGallery />
        <Stats />
        <Services />
        <Founder />
        <HappyClients />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default App;
