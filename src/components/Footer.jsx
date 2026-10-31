export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Work", href: "#projects" },
    { label: "Stack", href: "#expertise" },
    { label: "Journey", href: "#journey" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand */}
          <a href="#home" className="footer-brand">
            <span className="footer-brand-mark">V</span>

            <span className="footer-brand-info">
              <strong>Vijay Kumar</strong>
              <small>WEB DEVELOPER</small>
            </span>
          </a>

          <p className="footer-tagline">
            Building for the web.
            <span> Learning with every commit.</span>
          </p>

          {/* Back to top */}
          <a
            href="#home"
            className="footer-back-top"
            aria-label="Back to top"
          >
            <span>↑</span>
          </a>
        </div>

        <div className="footer-divider"></div>

        {/* <div className="footer-middle">
          <div className="footer-availability">
            <span className="footer-status-dot"></span>
            <span>OPEN TO OPPORTUNITIES</span>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            {navLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-socials">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
            >
              GH <span>↗</span>
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
            >
              in <span>↗</span>
            </a>
          </div>
        </div> */}

        <div className="footer-divider footer-bottom-divider"></div>

        <div className="footer-bottom">
          <p>
            © {currentYear} Vijay Kumar. All rights reserved.
          </p>

          {/* <p className="footer-built">
            DESIGNED & BUILT WITH <span>♥</span> AND CODE
          </p>

          <a href="#home" className="footer-top-link">
            BACK TO TOP ↑
          </a> */}
        </div>
      </div>
    </footer>
  );
}