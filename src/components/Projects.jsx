import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
const API_URL = `${import.meta.env.VITE_API_URL}/api/projects`;
const STORAGE_URL = `${import.meta.env.VITE_API_URL}/storage/`;

const filters = [
  { label: "All Projects", value: "all" },
  { label: "Frontend", value: "frontend" },
  { label: "Full Stack", value: "fullstack" },
];

function formatProject(project, index) {
  const tech = Array.isArray(project.technologies)
    ? project.technologies
    : (project.technologies || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const isFrontend =
    tech.some((item) =>
      ["React", "JavaScript", "CSS3", "Vite"].includes(item)
    ) &&
    !tech.some((item) => ["Laravel", "PHP"].includes(item));

  const category = isFrontend ? "Frontend" : "Full Stack";
  const colors = ["green", "cyan", "purple"];

  return {
    ...project,
    number: String(index + 1).padStart(2, "0"),
    category,
    tech,
    type: isFrontend ? "frontend" : "fullstack",
    icon: isFrontend ? "✳" : "◈",
    color: colors[index % colors.length],
    status: project.is_featured
      ? "FEATURED PROJECT"
      : "PERSONAL PROJECT",
    link: project.live_url || "",
    githubUrl:
      project.github_url ||
      project.github_link ||
      project.github ||
      project.repo_url ||
      "",
  };
}

function getImageUrl(image) {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${STORAGE_URL}${image.replace(/^\/+/, "")}`;
}

export default function Projects({ showAll = false }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Projects load nahi ho paaye.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("API se unexpected response mila.");
        }

        setProjects(result.data.map((project, index) =>
          formatProject(project, index)
        ));
      } catch (err) {
        setError(
          err.message ||
            "Projects load nahi ho paaye. Laravel server check karo."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const filteredProjects =
  
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.type === activeFilter);

      const visibleProjects = showAll
  ? filteredProjects
  : filteredProjects.slice(0, 6);

  const handleImageLoad = (event) => {
    const image = event.currentTarget;
    const viewport = image.closest(".preview-art");
    const wrapper = image.parentElement;

    if (!viewport || !wrapper) return;

    const imageHeight = image.getBoundingClientRect().height;
    const viewportHeight = viewport.clientHeight;
    const distance = Math.max(0, imageHeight - viewportHeight);

    wrapper.style.setProperty(
      "--image-scroll-distance",
      `-${distance}px`
    );

    // Longer screenshots get more time to scroll fully.
    const duration = Math.max(4, distance / 100);

    wrapper.style.setProperty(
      "--image-scroll-duration",
      `${duration}s`
    );
  };

  return (
    <section className="projects-section" id="projects">
      <div className="section-container">
        <div className="section-heading">
          <div className="section-eyebrow">
            <span></span>
            SELECTED WORK
          </div>

          <div className="projects-heading-row">
            <div>
              <h2>
                Projects that bring
                <br />
                <span>ideas to life.</span>
              </h2>

              <p>
                A selection of applications and interfaces I've worked on,
                combining thoughtful design with practical functionality.
              </p>
            </div>

            <div className="projects-count">
              <strong>{String(projects.length).padStart(2, "0")}</strong>
              <span>PROJECTS</span>
            </div>
          </div>
        </div>

        <div className="project-toolbar">
          <div className="project-filters" aria-label="Filter projects">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  activeFilter === filter.value
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <span className="project-total">
            SHOWING {visibleProjects.length} OF {filteredProjects.length} PROJECTS
          </span>
        </div>

        {isLoading && (
          <p role="status" className="projects-message">
            Loading projects...
          </p>
        )}

        {!isLoading && error && (
          <p role="alert" className="projects-message">
            {error}
          </p>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <p className="projects-message">
            Abhi koi project available nahi hai.
          </p>
        )}

        {!isLoading && !error && (
          <div className="projects-grid">
            {visibleProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className={`project-preview preview-${project.color}`}>
                  <div className="preview-topbar">
                    <div className="preview-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    <span className="preview-label">
                      {project.status}
                    </span>

                    <span className="preview-number">
                      {project.number}
                    </span>
                  </div>

                  <div className="preview-art">
                    {project.image ? (
                      <div className="project-image-scroll">
                        <img
                          src={getImageUrl(project.image)}
                          alt={`${project.title} website screenshot`}
                          className="project-preview-image"
                          onLoad={handleImageLoad}
                          onError={(event) => {
                            console.error(
                              "Project image failed to load:",
                              event.currentTarget.src
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="preview-glow"></div>
                        <div className="preview-orbit"></div>
                        <div className="preview-orbit preview-orbit-two"></div>

                        <div className="preview-icon">
                          {project.icon}
                        </div>

                        <div className="preview-project-title">
                          <span>PROJECT / {project.number}</span>
                          <strong>{project.title}</strong>
                          <small>
                            {project.category.toUpperCase()} DEVELOPMENT
                          </small>
                        </div>

                        <span className="preview-decoration decoration-one">
                          ✳
                        </span>
                        <span className="preview-decoration decoration-two">
                          +
                        </span>
                      </>
                    )}
                  </div>

                  <div className="preview-bottom">
                    <span>DESIGNED & BUILT WITH</span>
                    <span>↗</span>
                  </div>
                </div>

                <div className="project-info">
                  <div className="project-title-row">
                    <div>
                      <span className="project-category">
                        {project.category}
                      </span>

                      <h3>{project.title}</h3>
                    </div>

                    {project.live_url ? (
                      <a
                        href={project.live_url}
                        className="project-open"
                        aria-label={`Visit ${project.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ↗
                      </a>
                    ) : (
                      <span className="project-open" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </div>

                  <p className="project-description">
                    {project.description}
                  </p>

                  <div className="project-tech">
                    {project.tech.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  <div className="project-action-buttons">
                    <button
                      type="button"
                      className="project-action-btn case-study-btn"
                      onClick={() => setSelectedProject(project)}
                    >
                      Case Study <span>↗</span>
                    </button>

                    {project.live_url ? (
                      <a
                        href={project.live_url}
                        className="project-action-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Website <span>↗</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="project-action-btn project-btn-disabled"
                        disabled
                        title="Live website URL abhi add nahi hai"
                      >
                        Live Website
                      </button>
                    )}

                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        className="project-action-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub <span>↗</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="project-action-btn project-btn-disabled"
                        disabled
                        title="GitHub URL abhi add nahi hai"
                      >
                        GitHub
                      </button>
                    )}
                  </div>

                  <div className="project-card-footer">
                    <span>
                      <span className="project-status-dot"></span>
                      PROJECT OVERVIEW
                    </span>

                    <a href="#contact">Discuss project ↗</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="projects-bottom">
  {!showAll && filteredProjects.length > 6 && (
    <a href="/projects" className="view-all-projects">
      View All Projects
      <span>↗</span>
    </a>
  )}

  <span className="bottom-line"></span>

  <a href="#contact">
    Have a project in mind? Let's talk ↗
  </a>
</div>
      </div>

      {selectedProject &&
  createPortal(
    <div
      className="case-study-overlay"
      onClick={() => setSelectedProject(null)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
    >
      <div
        className="case-study-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "32px",
          background: "#101713",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "20px",
          opacity: 1,
          visibility: "visible",
          transform: "none",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          type="button"
          className="case-study-close"
          aria-label="Close case study"
          onClick={() => setSelectedProject(null)}
        >
          ×
        </button>

        <span className="case-study-eyebrow">
          PROJECT / {selectedProject.number}
        </span>

        <h2 id="case-study-title">{selectedProject.title}</h2>

        <span className="case-study-category">
          {selectedProject.category} Development
        </span>

        <h3>About this project</h3>
        <p>
          {selectedProject.case_study ||
            selectedProject.long_description ||
            selectedProject.details ||
            selectedProject.description ||
            "Project details abhi add nahi ki gayi hain."}
        </p>

        <h3>Technologies used</h3>
        <div className="project-tech case-study-tech">
          {selectedProject.tech.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>

        {selectedProject.features && (
          <>
            <h3>Key features</h3>
            {Array.isArray(selectedProject.features) ? (
              <ul className="case-study-features">
                {selectedProject.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p>{selectedProject.features}</p>
            )}
          </>
        )}

        <div className="case-study-actions">
          {selectedProject.live_url && (
            <a
              href={selectedProject.live_url}
              className="project-action-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Website ↗
            </a>
          )}

          {selectedProject.githubUrl && (
            <a
              href={selectedProject.githubUrl}
              className="project-action-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  )}
    </section>
  );
}
