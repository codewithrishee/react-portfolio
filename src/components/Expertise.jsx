import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/skills`;
const STORAGE_URL = `${import.meta.env.VITE_API_URL}/storage/`;

const defaultCategories = [
  "ALL",
  "LANGUAGES",
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS",
];

export default function Expertise() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
useEffect(() => {
  let cancelled = false;

  const fetchSkills = async () => {
    setLoading(true);
    setError("");

    try {
      let lastError;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();

        const timeout = setTimeout(
          () => controller.abort(),
          45000
        );

        try {
          const response = await fetch(API_URL, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`Skills API error: ${response.status}`);
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error("Invalid skills API response.");
          }

          if (cancelled) return;

          setSkills(data);
          setError("");
          return;

        } catch (err) {
          lastError = err;

          if (attempt < 2 && !cancelled) {
            await new Promise(resolve =>
              setTimeout(resolve, 2000)
            );
          }

        } finally {
          clearTimeout(timeout);
        }

        if (cancelled) return;
      }

      if (!cancelled) {
        console.error("Skills API error:", lastError);
        setError("Skills are temporarily unavailable. Please try again shortly.");
      }

    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchSkills();

  return () => {
    cancelled = true;
  };
}, []);


  // Generate filter categories dynamically from API data.
  const categories = [
    "ALL",
    ...new Set(
      skills
        .map((skill) =>
          skill.category === "LANGUAGE" ? "LANGUAGES" : skill.category,
        )
        .filter(Boolean),
    ),
  ];

  // Filter skills according to the selected category.
  const filteredSkills =
    activeCategory === "ALL"
      ? skills
      : skills.filter((skill) => {
          const group =
            skill.category === "LANGUAGE" ? "LANGUAGES" : skill.category;

          return group === activeCategory;
        });

        
  // Keep the selected filter valid when API data changes.
  useEffect(() => {
    if (activeCategory !== "ALL" && !categories.includes(activeCategory)) {
      setActiveCategory("ALL");
    }
  }, [activeCategory, skills]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="expertise-section" id="expertise">
      <div className="expertise-container">
        <div className="expertise-topline">
          <div>
            <span className="expertise-kicker">02 / TECHNOLOGIES</span>

            <h2>
              My <span>Stack.</span>
            </h2>
          </div>

          <p className="expertise-intro">
            The technologies I use to build responsive interfaces and practical
            web applications.
          </p>
        </div>

        {/* Category Filters */}
        {!loading && !error && skills.length > 0 && (
          <div className="expertise-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "expertise-filter active"
                    : "expertise-filter"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && <p className="expertise-intro">Loading technologies...</p>}

        {/* Error State */}
        {!loading && error && (
          <p className="expertise-intro" role="alert">
            {error}
          </p>
        )}

        {/* Empty State */}
        {!loading && !error && skills.length === 0 && (
          <p className="expertise-intro">No technologies available yet.</p>
        )}

        {/* Skills Grid */}
        {!loading && !error && (
          <div className="expertise-grid">
            {filteredSkills.map((skill) => (
              <article
                className={`expertise-card icon-${skill.color || "default"}`}
                key={skill.id ?? skill.name}
              >
                <div className="expertise-icon">
                  {skill.icon_type === "image" && skill.image ? (
                    <img
                      src={
  skill.image.startsWith("http")
    ? skill.image
    : `${import.meta.env.VITE_API_URL}/storage/${skill.image}`
}
                      alt={`${skill.name} logo`}
                    />
                  ) : (
                    <i
                      className={skill.icon || "bi bi-code-slash"}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="expertise-card-content">
                  <h3>{skill.name}</h3>

                  <span className="expertise-card-category">
                    {skill.category}
                  </span>

                  <p>{skill.description || ""}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && skills.length > 0 && (
          <div className="expertise-footer">
            <span>
              SHOWING {String(filteredSkills.length).padStart(2, "0")} SKILLS
            </span>

            <span className="expertise-footer-line"></span>

            <span>ALWAYS BUILDING · ALWAYS LEARNING</span>
          </div>
        )}
      </div>
    </section>
  );
}
