import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; 

const links = [
  { label: "Work", href: "#projects" },
  { label: "Stack", href: "#expertise" },
  { label: "Journey", href: "#journey" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Lock background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Track page scroll progress
  useEffect(() => {
    let animationFrame;

    const updateScrollProgress = () => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        const progress =
          scrollHeight > 0
            ? (window.scrollY / scrollHeight) * 100
            : 0;

        setScrollProgress(Math.min(100, Math.max(0, progress)));
      });
    };

    window.addEventListener("scroll", updateScrollProgress, {
      passive: true,
    });

    window.addEventListener("resize", updateScrollProgress);
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Close menu on Escape key (bonus accessibility)
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  // Scroll without adding #hash to the URL
  function handleNavClick(event, href) {
    event.preventDefault();

    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    closeMenu();
  }

  return (
    <>
      <header
        className="navbar"
        style={{
          "--scroll-progress": `${scrollProgress}%`,
        }}
      >
        <div className="navbar-inner">
          {/* BRAND */}
          <a
            href="#home"
            className="brand"
            onClick={(event) => handleNavClick(event, "#home")}
          >
            <span className="brand-mark">V</span>

            <span className="brand-name">
              Vijay Kumar
              <small>FULL STACK DEVELOPER</small>
            </span>
          </a>

          {/* DESKTOP NAVIGATION */}
          <nav className="nav-links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="nav-actions">
            <a
              href="/images/vijay-resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="nav-resume"
            >
              <span>▤</span> Resume
            </a>

            <a
              href="#contact"
              className="nav-cta"
              onClick={(event) => handleNavClick(event, "#contact")}
            >
              Let's Talk <span>↗</span>
            </a>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className={`mobile-menu-toggle ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ✅ FIX #2 — Drawer + Backdrop ko document.body me portal karo */}
      {createPortal(
        <>
          {/* BACKDROP */}
          <div
            className={`mobile-menu-backdrop ${menuOpen ? "visible" : ""}`}
            onClick={closeMenu}
            aria-hidden={!menuOpen}
          />

          {/* MOBILE OFF-CANVAS */}
          <aside
            id="mobile-navigation"
            className={`mobile-drawer ${menuOpen ? "drawer-open" : ""}`}
            aria-hidden={!menuOpen}
          >
            <div className="drawer-top">
              <span className="drawer-label">NAVIGATION</span>

              <button
                type="button"
                className="drawer-close"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="drawer-profile">
              <span className="drawer-profile-mark">V</span>

              <div>
                <strong>Vijay Kumar</strong>
                <span>PHP &amp; LARAVEL DEVELOPER</span>
              </div>
            </div>

            <nav className="drawer-links">
              {links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  style={{ "--link-index": index }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="drawer-link-number">
                    0{index + 1}
                  </span>

                  <span>{link.label}</span>

                  <span className="drawer-link-arrow">↗</span>
                </a>
              ))}
            </nav>

            <div className="drawer-bottom">
              <a
                href="/images/vijay-resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="drawer-resume"
                onClick={closeMenu}
              >
                <span>▤</span>
                View My Resume
                <span className="drawer-link-arrow">↗</span>
              </a>

              <a
                href="#contact"
                className="drawer-contact"
                onClick={(event) => handleNavClick(event, "#contact")}
              >
                Let's Work Together <span>↗</span>
              </a>

              <div className="drawer-availability">
                <span></span> OPEN TO OPPORTUNITIES
              </div>
            </div>
          </aside>
        </>,
        document.body 
      )}
    </>
  );
}