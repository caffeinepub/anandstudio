import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { useGetContactInfo } from "../hooks/useQueries";

const DEFAULT_CONTACT = `Email: hello@anandstudio.in
Phone: +91 98765 43210
Address: 12 Lens Lane, Bandra West, Mumbai — 400050

Instagram: @anandstudio
Facebook: /anandstudiophotography

Working Hours: Monday–Saturday, 10am – 7pm`;

export default function ContactSection() {
  const { data: contactInfo, isLoading } = useGetContactInfo();
  const text = contactInfo?.trim() ? contactInfo : DEFAULT_CONTACT;

  return (
    <section id="contact" className="py-24 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-divider" />
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Get in Touch
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-sm">
              Ready to capture your story? We'd love to hear about your vision.
              Reach out and let's create something beautiful together.
            </p>

            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors duration-200"
                aria-label="Instagram"
                data-ocid="contact.link"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors duration-200"
                aria-label="Facebook"
                data-ocid="contact.link"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right - Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="space-y-4" data-ocid="contact.loading_state">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-5 w-3/4" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {text
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => {
                    const isEmail = line.toLowerCase().startsWith("email:");
                    const isPhone = line.toLowerCase().startsWith("phone:");
                    const isAddr = line.toLowerCase().startsWith("address:");

                    const Icon = isEmail
                      ? Mail
                      : isPhone
                        ? Phone
                        : isAddr
                          ? MapPin
                          : null;

                    return (
                      <div key={line} className="flex items-start gap-3">
                        {Icon && (
                          <div className="mt-0.5 shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <p
                          className={`text-sm leading-relaxed ${
                            Icon
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60 pl-7"
                          }`}
                        >
                          {line}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
