import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/skills`;

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
    const fetchSkills = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Failed to fetch skills (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid skills data received from API.");
        }

        setSkills(data);
      } catch (err) {
        console.error("Skills API error:", err);
        setError("Unable to load skills. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Generate filter categories dynamically from API data.
  const categories = [
    "ALL",
    ...new Set(
      skills
        .map((skill) =>
          skill.category === "LANGUAGE"
            ? "LANGUAGES"
            : skill.category
        )
        .filter(Boolean)
    ),
  ];

  // Filter skills according to the selected category.
  const filteredSkills =
    activeCategory === "ALL"
      ? skills
      : skills.filter((skill) => {
          const group =
            skill.category === "LANGUAGE"
              ? "LANGUAGES"
              : skill.category;

          return group === activeCategory;
        });

  // Keep the selected filter valid when API data changes.
  useEffect(() => {
    if (
      activeCategory !== "ALL" &&
      !categories.includes(activeCategory)
    ) {
      setActiveCategory("ALL");
    }
  }, [activeCategory, skills]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="expertise-section" id="expertise">
      <div className="expertise-container">
        <div className="expertise-topline">
          <div>
            <span className="expertise-kicker">
              02 / TECHNOLOGIES
            </span>

            <h2>
              My <span>Stack.</span>
            </h2>
          </div>

          <p className="expertise-intro">
            The technologies I use to build responsive interfaces
            and practical web applications.
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
        {loading && (
          <p className="expertise-intro">
            Loading technologies...
          </p>
        )}

        {/* Error State */}
        {!loading && error && (
          <p className="expertise-intro" role="alert">
            {error}
          </p>
        )}

        {/* Empty State */}
        {!loading && !error && skills.length === 0 && (
          <p className="expertise-intro">
            No technologies available yet.
          </p>
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
                  <span>
                    {skill.icon || skill.name?.charAt(0)}
                  </span>
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
              SHOWING{" "}
              {String(filteredSkills.length).padStart(2, "0")} SKILLS
            </span>

            <span className="expertise-footer-line"></span>

            <span>ALWAYS BUILDING · ALWAYS LEARNING</span>
          </div>
        )}
      </div>
    </section>
  );
}