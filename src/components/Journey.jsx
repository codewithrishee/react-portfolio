import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/journeys`;

export default function Journey() {
  const [journeyItems, setJourneyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJourneys() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load journey.");
        }

        const data = await response.json();

        setJourneyItems(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJourneys();
  }, []);

  return (
    <section className="journey-section" id="journey">
      <div className="journey-container">
        <div className="journey-section-label">
          <span className="journey-section-number">03</span>
          <span className="journey-section-name">JOURNEY</span>
        </div>

        <h2 className="journey-main-title">
          Foundations first, then shipping.
        </h2>

        {loading && <p>Loading journey...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="journey-timeline">
            {journeyItems.map((item, index) => (
              <article
                className="journey-entry"
                key={item.id ?? `${item.year}-${index}`}
              >
                <div className="journey-year">{item.year}</div>

                <div className="journey-timeline-track">
                  <span className="journey-timeline-dot"></span>

                  {index !== journeyItems.length - 1 && (
                    <span className="journey-timeline-line"></span>
                  )}
                </div>

                <div className="journey-entry-content">
                  <h3>{item.title}</h3>

                  <span className="journey-entry-subtitle">
                    {item.subtitle}
                  </span>

                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}