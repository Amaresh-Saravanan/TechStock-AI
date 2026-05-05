import { Link } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  Monitor,
  Heart,
  Layers,
  Zap,
  TrendingUp,
  BarChart3,
  Bell,
  Cpu,
  Check,
  ChevronRight,
  Globe,
  Shield,
  Rocket,
  Sparkles,
} from "lucide-react";
import "../styles/landing.css";

/* Lazy-load the 3D Earth scene */
const EarthScene = lazy(() => import("../components/landing/EarthScene"));

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); io.unobserve(el); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── Staggered children reveal ─── */
function useStaggerReveal(count: number, base = 120) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add("visible"), i * base);
            io.unobserve(el);
          }
        },
        { threshold: 0.1 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [count, base]);
  return (i: number) => (el: HTMLDivElement | null) => { refs.current[i] = el; };
}

/* ─── Animated counter for pricing ─── */
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, value };
}

/* ═══════════════════════════════════════════════════════ */
/*                     HOME PAGE                         */
/* ═══════════════════════════════════════════════════════ */
const Home = () => {
  const featRef = useReveal();
  const aboutRef = useReveal();
  const servRef = useReveal();
  const priceRef = useReveal();
  const trustRef = useReveal();

  const featCards = useStaggerReveal(4, 150);
  const aboutCards = useStaggerReveal(3, 180);
  const servCards = useStaggerReveal(4, 140);
  const priceCards = useStaggerReveal(3, 200);

  return (
    <div style={{ background: "#050A18", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ─── NAV ─── */}
      <nav className="nav-neo">
        <Link to="/" className="logo-neo">
          <div className="logo-icon">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span>TechStock AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "About", "Services", "Pricing"].map((s) => (
            <a key={s} href={`#${s.toLowerCase()}`} className="nav-link-neo">{s}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <button className="btn-outline-neo" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-primary-neo" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── FIXED 3D EARTH BACKGROUND ─── */}
      <Suspense fallback={null}>
        <EarthScene />
      </Suspense>

      {/* ─── HERO ─── */}
      <section className="hero-full relative z-10" style={{ background: "transparent" }}>
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center h-full pt-20">
          {/* Left Text Content */}
          <div style={{ textAlign: "left" }}>
            <div className="section-label" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "#0f172a", border: "none", color: "#60a5fa", borderRadius: "999px", padding: "6px 16px", fontSize: "0.85rem", alignItems: "center", gap: "8px" }}>
              Welcome to TechStock AI <ChevronRight className="w-4 h-4" />
            </div>

            <h1 className="hero-heading" style={{ textAlign: "left", fontSize: "clamp(3rem, 6vw, 4.5rem)", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              <span style={{ color: "#fff" }}>Next-Gen</span>
              <br />
              <span style={{ color: "#fff" }}>Inventory & Trading</span>
              <br />
              <span style={{ color: "#fff" }}>Infrastructure.</span>
            </h1>

            <p className="hero-sub" style={{ textAlign: "left", margin: "0 0 2.5rem 0", color: "rgba(148,163,184,0.7)", maxWidth: "500px", fontSize: "1.1rem" }}>
              TechStock redefines the retail experience by combining the usability of centralized
              exchanges with the transparency and security of decentralized protocols.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <button className="btn-primary-neo" style={{ background: "#fff", color: "#000" }}>
                  Get Started For Free
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-outline-neo" style={{ background: "#fff", color: "#000", border: "none" }}>
                  Explore More
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right side is intentionally empty to let the 3D scene show through */}
          <div></div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-neo">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section style={{ padding: "3.5rem 0", borderTop: "1px solid rgba(59,130,246,0.06)", borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
        <div ref={trustRef} className="section-reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem", color: "rgba(100,116,139,0.5)", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Trusted by over <span style={{ color: "#22d3ee" }}>1,000</span> organizations worldwide
          </p>
          <div className="trusted-strip">
            {["DELL", "Zendesk", "Rakuten", "Pacific Funds", "NCR", "Lattice", "TEK"].map((n) => (
              <span key={n} className="trusted-name">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative z-10" style={{ padding: "7rem 0" }}>
        <div ref={featRef} className="section-reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ margin: "0 auto 1rem" }}>
              <Sparkles className="w-3.5 h-3.5" /> Features
            </div>
            <h2 className="section-heading">
              Discover <span className="gradient-text-neo">Features</span>
            </h2>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(148,163,184,0.7)", maxWidth: 600, margin: "0 auto" }}>
              Everything you need to dominate inventory management — AI predictions, real-time sync, and multi-platform integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Monitor className="h-6 w-6 text-cyan-400" />, title: "Fully Responsive", desc: "Seamless experience on any device — desktop, tablet, or mobile." },
              { icon: <Heart className="h-6 w-6 text-cyan-400" />, title: "Built with Care", desc: "Every feature is meticulously crafted to enhance your workflow." },
              { icon: <Layers className="h-6 w-6 text-cyan-400" />, title: "Multi-Platform", desc: "Integrate all your e-commerce channels in one unified dashboard." },
              { icon: <Zap className="h-6 w-6 text-cyan-400" />, title: "Real-Time Sync", desc: "Lightning-fast data sync across all channels, always up-to-date." },
            ].map((f, i) => (
              <div key={f.title} ref={featCards(i)} className={i % 2 === 0 ? "card-reveal-left" : "card-reveal-right"}>
                <div className="glass-card-neo" style={{ height: "100%" }}>
                  <div className="icon-neo">{f.icon}</div>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: "#fff", fontSize: "1.05rem", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="relative z-10" style={{ padding: "7rem 0" }}>
        <div ref={aboutRef} className="section-reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-heading">
              About <span className="gradient-text-neo">Us</span>
            </h2>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#22d3ee", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.8rem", marginBottom: "1rem" }}>
              We Create Awesome Solutions
            </p>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", maxWidth: 600, margin: "0 auto" }}>
              Revolutionizing tech retail with cutting-edge AI and machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <TrendingUp className="h-8 w-8 text-cyan-400" />, title: "AI Predictions", desc: "Analyzes market trends, seasonal patterns, and history to optimize stock levels." },
              { icon: <BarChart3 className="h-8 w-8 text-cyan-400" />, title: "Smart Analytics", desc: "Real-time analytics, custom reports, and actionable recommendations." },
              { icon: <Bell className="h-8 w-8 text-cyan-400" />, title: "Intelligent Alerts", desc: "Smart notifications for low stock, price changes, and supply chain issues." },
            ].map((a, i) => (
              <div key={a.title} ref={aboutCards(i)} className="card-reveal-up" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="glass-card-neo" style={{ textAlign: "center", height: "100%" }}>
                  <div className="icon-neo" style={{ width: 70, height: 70, margin: "0 auto 1.25rem", borderRadius: 20 }}>{a.icon}</div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#fff", fontSize: "1.2rem", marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="relative z-10" style={{ padding: "7rem 0" }}>
        <div ref={servRef} className="section-reveal" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-heading">
              Our <span className="gradient-text-neo">Services</span>
            </h2>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", maxWidth: 600, margin: "0 auto" }}>
              Comprehensive solutions to streamline your tech retail operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Globe className="h-7 w-7 text-cyan-400" />, title: "Price Tracking", desc: "Monitor competitor prices and adjust strategy in real-time." },
              { icon: <Cpu className="h-7 w-7 text-cyan-400" />, title: "Build Generator", desc: "AI-powered PC builds based on requirements and inventory." },
              { icon: <Shield className="h-7 w-7 text-cyan-400" />, title: "Inventory Security", desc: "Advanced features to protect data and prevent unauthorized access." },
              { icon: <Rocket className="h-7 w-7 text-cyan-400" />, title: "Quick Integration", desc: "Seamlessly connect your existing platforms and ERP systems." },
            ].map((s, i) => (
              <div key={s.title} ref={servCards(i)} className="card-reveal-scale">
                <div className="glass-card-neo" style={{ height: "100%" }}>
                  <div className="icon-neo">{s.icon}</div>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: "#fff", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="relative z-10" style={{ padding: "7rem 0" }}>
        <div ref={priceRef} className="section-reveal" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-heading">
              Choose Your <span className="gradient-text-neo">Plan</span>
            </h2>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.7)", maxWidth: 500, margin: "0 auto" }}>
              Flexible pricing that scales with your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <PricingCard ref_={priceCards(0)} title="Individual" subtitle="For small retailers" oldPrice="$29.99" price={19} cents=".99"
              features={["Up to 1,000 SKUs", "Basic AI predictions", "Price tracking (5)", "Email support", "Basic dashboard"]} cta="Get Started" />
            <PricingCard ref_={priceCards(1)} title="Team" subtitle="For growing businesses" oldPrice="$49.99" price={34} cents=".99"
              features={["Up to 10,000 SKUs", "Advanced AI", "Unlimited tracking", "Team collab (5)", "Priority support", "Custom reports"]} cta="Get Team Access" popular />
            <PricingCard ref_={priceCards(2)} title="Pro+" subtitle="For enterprise" oldPrice="$99.99" price={59} cents=".99"
              features={["Unlimited SKUs", "Enterprise AI", "API access", "Account manager", "24/7 support", "Custom integrations"]} cta="Get Pro+ Access" />
          </div>
        </div>
      </section>

      {/* ─── FOOTER (simplified) ─── */}
      <footer className="footer-neo relative z-10" style={{ background: "rgba(3,7,18,0.8)", backdropFilter: "blur(10px)" }}>
        <div className="logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
          <Cpu className="h-3.5 w-3.5 text-white" />
        </div>
        <span>© 2026 TechStock AI</span>
      </footer>
    </div>
  );
};

/* ─── Pricing Card with animated counter ─── */
function PricingCard({
  ref_,
  title,
  subtitle,
  oldPrice,
  price,
  cents,
  features,
  cta,
  popular,
}: {
  ref_: (el: HTMLDivElement | null) => void;
  title: string;
  subtitle: string;
  oldPrice: string;
  price: number;
  cents: string;
  features: string[];
  cta: string;
  popular?: boolean;
}) {
  const counter = useAnimatedNumber(price);

  return (
    <div ref={ref_} className="card-reveal-up">
      <div ref={counter.ref} className={`pricing-card ${popular ? "popular" : ""}`}>
        {popular && (
          <div style={{
            position: "absolute", top: 0, right: 0,
            padding: "4px 16px", borderRadius: "0 24px 0 12px",
            background: "linear-gradient(135deg, #0891b2, #3b82f6)",
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "0.7rem", fontWeight: 700, color: "#fff", letterSpacing: "0.08em",
          }}>
            POPULAR
          </div>
        )}
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#fff", fontSize: "1.3rem" }}>{title}</h3>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(148,163,184,0.6)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{subtitle}</p>

        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ color: "rgba(100,116,139,0.4)", textDecoration: "line-through", fontSize: "0.9rem" }}>{oldPrice}</span>
          <div className="flex items-baseline gap-0.5">
            <span className="price-amount">${counter.value}</span>
            <span className="price-cents">{cents}</span>
          </div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(100,116,139,0.4)", fontSize: "0.75rem", marginTop: 4 }}>Billed monthly / Per user</p>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: popular ? "#0891b2" : "rgba(34,211,238,0.15)",
              }}>
                <Check className="h-3 w-3" style={{ color: popular ? "#fff" : "#22d3ee" }} />
              </div>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(203,213,225,0.8)", fontSize: "0.9rem" }}>{f}</span>
            </li>
          ))}
        </ul>

        <Link to="/register" style={{ display: "block" }}>
          <button className={popular ? "btn-primary-neo" : "btn-outline-neo"} style={{ width: "100%", justifyContent: "center" }}>
            {cta}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
