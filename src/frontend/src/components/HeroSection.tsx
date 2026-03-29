import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

export default function HeroSection() {
  const scrollToPortfolio = () => {
    document
      .querySelector("#portfolio")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-anandstudio.dim_1920x1080.jpg"
          alt="Anandstudio"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-primary tracking-[0.4em] uppercase text-xs md:text-sm font-sans mb-6"
          >
            Professional Photography
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-none tracking-tight mb-8"
          >
            Anand
            <br />
            <span className="text-primary italic">Studio</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-md"
          >
            Capturing life's most precious moments with artistry and precision.
            From intimate portraits to grand celebrations — every frame tells
            your story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={scrollToPortfolio}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm tracking-widest uppercase font-sans"
              data-ocid="hero.primary_button"
            >
              View Portfolio
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-foreground/30 text-foreground hover:bg-foreground/10 px-8 py-6 text-sm tracking-widest uppercase font-sans"
              data-ocid="hero.secondary_button"
            >
              Book a Session
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToPortfolio}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          delay: 1.5,
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
        data-ocid="hero.button"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.button>
    </section>
  );
}
