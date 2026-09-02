import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OsOverview from "@/components/OsOverview";
import StackStrip from "@/components/StackStrip";
import Framework from "@/components/Framework";
import FeatureScoreboards from "@/components/FeatureScoreboards";
import FeatureBuiltInAI from "@/components/FeatureBuiltInAI";
import FeatureCfo from "@/components/FeatureCfo";
import FeatureAiMeetings from "@/components/FeatureAiMeetings";
import FeatureSop from "@/components/FeatureSop";
import FeatureProjectsTasks from "@/components/FeatureProjectsTasks";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <OsOverview />
      <StackStrip />
      <Framework />
      <FeatureScoreboards />
      <FeatureBuiltInAI />
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>
      <FeatureCfo />
      <FeatureAiMeetings />
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>
      <FeatureSop />
      <FeatureProjectsTasks />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  );
}
