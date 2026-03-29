import { Camera } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="font-display text-sm tracking-widest uppercase text-foreground">
              Anandstudio
            </span>
          </div>

          <p className="text-muted-foreground text-xs tracking-wide text-center">
            © {year}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>

          <div className="flex gap-6">
            {["Home", "Portfolio", "About", "Services", "Contact"].map(
              (link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() =>
                    document
                      .querySelector(`#${link.toLowerCase()}`)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
