import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useGetAbout } from "../hooks/useQueries";

const DEFAULT_ABOUT = `Anandstudio was founded with a single vision: to transform fleeting moments into timeless art. With over a decade of experience capturing life's most meaningful events, we bring both technical mastery and emotional sensitivity to every shoot.

Our studio is built on the belief that every person, every couple, every event deserves to be remembered beautifully. We work closely with our clients to understand their story, their style, and their vision — ensuring that every photograph we deliver is not just an image, but a memory preserved forever.

Based in the heart of the city, we travel wherever the story takes us.`;

export default function AboutSection() {
  const { data: about, isLoading } = useGetAbout();
  const text = about?.trim() ? about : DEFAULT_ABOUT;

  return (
    <section id="about" className="py-24 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800"
                alt="Studio atmosphere"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 border border-primary/30 -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 -z-10" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="section-divider" />
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
              About the Studio
            </h2>

            {isLoading ? (
              <div className="space-y-3" data-ocid="about.loading_state">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Skeleton key={n} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {text.split("\n\n").map((para) => (
                  <p
                    key={para.slice(0, 40)}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
              {[
                { num: "10+", label: "Years Experience" },
                { num: "500+", label: "Happy Clients" },
                { num: "50K+", label: "Photos Delivered" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl text-primary">
                    {stat.num}
                  </p>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
