
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/about`;

export default function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAbout = async () => {
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
            throw new Error(`About API error: ${response.status}`);
          }

          const data = await response.json();

          if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new Error("Invalid About API response.");
          }

          if (!cancelled) {
            setAbout(data);
          }

          return;

        } catch (error) {
          if (attempt === 2 && !cancelled) {
            console.error("About API error:", error);
          }

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
    };

    fetchAbout();

    return () => {
      cancelled = true;
    };
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
                  alt={about.name || "Profile"}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <div className="profile-image-placeholder">
                <span>
                  {(about.name || "V")
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
