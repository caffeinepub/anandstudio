import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useGetAllServices } from "../hooks/useQueries";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  wedding: Heart,
  portrait: User,
  event: Calendar,
  commercial: Briefcase,
};

const DEFAULT_SERVICES = [
  {
    id: "d1",
    name: "Wedding Photography",
    description:
      "Full-day coverage of your special day from preparations to the last dance. Delivered as a beautifully curated album.",
    priceRange: "₹80,000 – ₹1,50,000",
  },
  {
    id: "d2",
    name: "Portrait Sessions",
    description:
      "Individual and family portraits in studio or at a location of your choice. Ideal for professionals and personal milestones.",
    priceRange: "₹10,000 – ₹30,000",
  },
  {
    id: "d3",
    name: "Event Coverage",
    description:
      "Corporate galas, birthday celebrations, award ceremonies — we capture the energy and emotion of every event.",
    priceRange: "₹30,000 – ₹80,000",
  },
  {
    id: "d4",
    name: "Commercial Photography",
    description:
      "Product photography, brand campaigns, and editorial shoots tailored to your marketing goals and brand identity.",
    priceRange: "₹25,000 – ₹70,000",
  },
];

function getIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SERVICE_ICONS)) {
    if (lower.includes(key)) return SERVICE_ICONS[key];
  }
  return Briefcase;
}

export default function ServicesSection() {
  const { data: services, isLoading } = useGetAllServices();
  const displayServices =
    services && services.length > 0 ? services : DEFAULT_SERVICES;

  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="section-divider" />
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Services
          </h2>
          <p className="text-muted-foreground max-w-md">
            Tailored photography packages to suit every occasion and budget.
          </p>
        </motion.div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            data-ocid="services.loading_state"
          >
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-56 w-full" />
            ))}
          </div>
        ) : displayServices.length === 0 ? (
          <div
            className="text-center py-24 text-muted-foreground"
            data-ocid="services.empty_state"
          >
            <p className="font-display text-2xl">Services coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayServices.map((service, idx) => {
              const Icon = getIcon(service.name);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group border border-border hover:border-primary/50 p-8 transition-all duration-300 hover:bg-card"
                  data-ocid={`services.item.${idx + 1}`}
                >
                  <div className="flex items-start gap-5">
                    <div className="p-3 border border-border group-hover:border-primary/50 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-foreground mb-3">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-primary text-sm font-sans tracking-wide">
                          {service.priceRange}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
