import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/hero`;

const defaultHero = {
  name: "Vijay Kumar",
  eyebrow: "AVAILABLE FOR OPPORTUNITIES",
  role_prefix: "Full Stack",
  role_suffix: "Developer",
  technologies: "PHP · Laravel · React",
  heading_line_1: "I build production-ready",
  heading_line_2: "interfaces for the modern web.",
  roles: [
    "PHP Developer",
    "Laravel Developer",
    "React Developer",
    "Full Stack Developer",
  ],
  description:
    "I build responsive websites and practical web applications using modern frontend technologies and reliable backend solutions. Focused on clean code, useful experiences and continuous improvement.",
  primary_button_text: "Explore My Work",
  primary_button_link: "#projects",
  secondary_button_text: "Get in touch",
  secondary_button_link: "#contact",
  github_url: "https://github.com/",
  linkedin_url: "https://www.linkedin.com/",
  instagram_url: "https://www.instagram.com/i.xvijayyyyy/",
  facebook_url: "https://www.facebook.com/profile.php?id=100054973491531",
  experience_value: "06+",
  experience_label: "MONTHS EXPERIENCE",
  technology_count: "05+",
  technology_label: "TECHNOLOGIES",
  project_count: "03+",
  project_label: "PROJECTS BUILT",
  availability_text: "Open",
  availability_label: "TO OPPORTUNITIES",
};

export default function Hero() {
  const [hero, setHero] = useState(defaultHero);

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch dynamic Hero data from Laravel

  useEffect(() => {
    let cancelled = false;

    async function fetchHero() {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();

        const timeout = setTimeout(() => controller.abort(), 45000);

        try {
          const response = await fetch(API_URL, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`Hero API failed: ${response.status}`);
          }

          const data = await response.json();

          if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data) &&
            !cancelled
          ) {
            setHero((previous) => ({
              ...previous,
              ...data,
              roles:
                Array.isArray(data.roles) && data.roles.length > 0
                  ? data.roles
                  : previous.roles,
            }));
          }

          return;
        } catch (error) {
          if (attempt === 2 && !cancelled) {
            console.error("Hero API Error:", error);
          }

          if (attempt < 2 && !cancelled) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } finally {
          clearTimeout(timeout);
        }

        if (cancelled) return;
      }
    }

    fetchHero();

    return () => {
      cancelled = true;
    };
  }, []);

  const roles =
    Array.isArray(hero.roles) && hero.roles.length > 0
      ? hero.roles
      : defaultHero.roles;

  // Reset typewriter when the roles change
  useEffect(() => {
    setRoleIndex(0);
    setDisplayText("");
    setIsDeleting(false);
  }, [hero.roles]);

  // Typewriter effect
  useEffect(() => {
    const currentRole = roles[roleIndex % roles.length];
    let delay = isDeleting ? 45 : 100;

    if (!isDeleting && displayText === currentRole) {
      delay = 1500;
    } else if (isDeleting && displayText === "") {
      delay = 350;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentRole) {
        setIsDeleting(true);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setRoleIndex((current) => (current + 1) % roles.length);
      } else if (isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
      } else {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot"></span>
            {hero.eyebrow}
          </div>

          <h1>
            {hero.name}
            <span className="accent">.</span>
          </h1>

          <p className="hero-role">
            <span className="hero-role-highlight">
              ———&nbsp;&nbsp; {hero.role_prefix}
            </span>
            <span className="hero-role-light"> {hero.role_suffix}</span>
            <span className="hero-role-separator"> · </span>
            <span className="hero-role-light">{hero.technologies}</span>
          </p>

          <h2>
            {hero.heading_line_1} <span></span>
            <br />
            {hero.heading_line_2}
          </h2>

          <p className="hero-role">
            <span className="typewriter-text">{displayText}</span>
            <span className="typewriter-cursor">|</span>
          </p>

          <p className="hero-description">{hero.description}</p>

          <div className="hero-actions">
            <a
              href={hero.primary_button_link || "#projects"}
              className="btn-primary"
            >
              {hero.primary_button_text}
              <span>↗</span>
            </a>

            <a
              href={hero.secondary_button_link || "#contact"}
              className="btn-secondary"
            >
              <span className="play-icon">↗</span>
              {hero.secondary_button_text}
            </a>
          </div>

          <div className="hero-socials">
            {hero.github_url && (
              <>
                <a
                  href={hero.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.06 3.6 1.57.1-.73.4-1.23.7-1.52-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.16-2.99-.12-.29-.5-1.42.11-2.95 0 0 .95-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.1-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.95.72.78 1.16 1.77 1.16 2.99 0 4.27-2.6 5.21-5.08 5.49.4.34.75 1 .75 2.02v3.01c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                  </svg>
                </a>

                <span></span>
              </>
            )}

            {hero.linkedin_url && (
              <a
                href={hero.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.45H4.97V9h2.96v9.45ZM6.45 7.71a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12 10.74h-2.96v-4.6c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.19-1.77 2.43v4.68H9.23V9h2.84v1.29h.04c.4-.74 1.36-1.53 2.8-1.53 3 0 3.55 1.97 3.55 4.53v5.16Z" />
                </svg>
              </a>
            )}

            {hero.instagram_url && (
              <>
                <a
                  href={hero.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </a>
                <span></span>
              </>
            )}

            {hero.facebook_url && (
              <a
                href={hero.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h2.8v8h3.7Z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="hero-visual" aria-label="Animated abstract planet">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="orbit orbit-three"></div>

          <div className="planet">
            <div className="planet-highlight"></div>
            <div className="planet-shadow"></div>
          </div>

          <span className="planet-star star-one">✦</span>
          <span className="planet-star star-two">✧</span>
          <span className="planet-star star-three">·</span>
          <span className="planet-star star-four">✦</span>
        </div>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <strong>{hero.experience_value}</strong>
          <small>{hero.experience_label}</small>
        </div>

        <div className="stat">
          <strong>{hero.technology_count}</strong>
          <small>{hero.technology_label}</small>
        </div>

        <div className="stat">
          <strong>{hero.project_count}</strong>
          <small>{hero.project_label}</small>
        </div>

        <div className="stat stat-availability">
          <span className="status-dot"></span>
          <div>
            <strong>{hero.availability_text}</strong>
            <small>{hero.availability_label}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
