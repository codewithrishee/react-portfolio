import { useEffect, useState } from "react";

export default function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/about")
      .then((response) => {
        if (!response.ok) throw new Error("About fetch failed");
        return response.json();
      })
      .then(setAbout)
      .catch((error) => console.error("About API:", error));
  }, []);

  if (!about || !about.is_active) return null;

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-visual">
          <div className="about-education">
            <div className="education-label">
              <span>◇</span> CURRENTLY
            </div>
            <h3>{about.education}</h3>
            <p>{about.education_description}</p>
          </div>

          <div className="about-profile-card">
            <div className="about-profile-image">
              {about.image && (
                <img
                  src={about.image}
                  alt={about.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <div className="profile-image-placeholder">
                <span>
                  {about.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <p>{about.profile_technologies}</p>
              </div>
            </div>

            <div className="about-profile-caption">
              <h3>{about.name}</h3>
              <span>{about.location}</span>
            </div>
          </div>
        </div>

        <div className="about-content">
          <div className="about-section-label">
            <span className="about-number">{about.section_number}</span>
            <span className="about-label-text">ABOUT</span>
          </div>

          <h2>{about.heading}</h2>

          <p>{about.paragraph_1}</p>
          <p>{about.paragraph_2}</p>
          {about.paragraph_3 && <p>{about.paragraph_3}</p>}

          <div className="about-info-panel">
            <div className="about-info-item">
              <span>LOOKING FOR</span>
              <strong>{about.looking_for}</strong>
            </div>

            <div className="about-info-item">
              <span>LOCATION</span>
              <strong>{about.location}</strong>
            </div>

            <div className="about-info-item">
              <span>AVAILABILITY</span>
              <strong>{about.availability}</strong>
            </div>

            <div className="about-info-item">
              <span>TECHNOLOGIES</span>
              <strong>{about.technologies}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}