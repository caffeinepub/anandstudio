import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Category } from "../backend";
import { useGetPhotosByCategory } from "../hooks/useQueries";

const FILTERS = [
  { label: "All", value: "all" as const },
  { label: "Weddings", value: Category.weddings },
  { label: "Portraits", value: Category.portraits },
  { label: "Events", value: Category.events },
  { label: "Commercial", value: Category.commercial },
];

type SamplePhoto = {
  id: string;
  title: string;
  category: Category;
  url: string;
};

const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: "s1",
    title: "Golden Hour Wedding",
    category: Category.weddings,
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
  },
  {
    id: "s2",
    title: "Corporate Portrait",
    category: Category.portraits,
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800",
  },
  {
    id: "s3",
    title: "Brand Campaign",
    category: Category.commercial,
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
  },
  {
    id: "s4",
    title: "Wedding Ceremony",
    category: Category.weddings,
    url: "https://images.unsplash.com/photo-1529636444744-adffc9135a5e?w=800",
  },
  {
    id: "s5",
    title: "Festival Moments",
    category: Category.events,
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  },
  {
    id: "s6",
    title: "Studio Portrait",
    category: Category.portraits,
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
  },
  {
    id: "s7",
    title: "Product Launch",
    category: Category.commercial,
    url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
  },
  {
    id: "s8",
    title: "Anniversary Gala",
    category: Category.events,
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
  },
];

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const { data: photos, isLoading } = useGetPhotosByCategory(activeFilter);

  const backendPhotos = photos && photos.length > 0 ? photos : null;
  const sampleFiltered = SAMPLE_PHOTOS.filter(
    (p) => activeFilter === "all" || p.category === activeFilter,
  );

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-background">
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
            Portfolio
          </h2>
          <p className="text-muted-foreground max-w-md">
            A curated selection of our finest work across different genres and
            occasions.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              role="tab"
              aria-selected={activeFilter === f.value}
              className={`px-5 py-2 text-xs tracking-widest uppercase font-sans transition-all duration-200 border ${
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}
              data-ocid="portfolio.tab"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="masonry-grid" data-ocid="portfolio.loading_state">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="masonry-item">
                <Skeleton className="w-full h-48" />
              </div>
            ))}
          </div>
        ) : backendPhotos === null && sampleFiltered.length === 0 ? (
          <div
            className="text-center py-24 text-muted-foreground"
            data-ocid="portfolio.empty_state"
          >
            <p className="font-display text-2xl mb-2">No photos yet</p>
            <p className="text-sm tracking-wide">
              Photos will appear here once added by the admin.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="masonry-grid"
            >
              {(backendPhotos ?? sampleFiltered).map((photo, idx) => {
                const imgUrl =
                  "url" in photo
                    ? (photo as SamplePhoto).url
                    : photo.blob.getDirectURL();
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                    className="masonry-item group relative overflow-hidden"
                    data-ocid={`portfolio.item.${idx + 1}`}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={photo.title}
                        className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-foreground text-sm font-display">
                          {photo.title}
                        </p>
                        <p className="text-primary text-xs tracking-widest uppercase mt-1">
                          {photo.category}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
