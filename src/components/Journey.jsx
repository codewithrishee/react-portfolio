import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/journeys`;

export default function Journey() {
  const [journeyItems, setJourneyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
useEffect(() => {
  let cancelled = false;

  async function fetchJourneys() {
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
            throw new Error(`Journey API error: ${response.status}`);
          }

          const result = await response.json();

          const items = Array.isArray(result)
            ? result
            : result.data;

          if (!Array.isArray(items)) {
            throw new Error("Invalid journey API response.");
          }

          if (cancelled) return;

          setJourneyItems(items);
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
        setError(
          lastError?.name === "AbortError"
            ? "Journey is taking longer than expected. Please try again."
            : "Journey is temporarily unavailable."
        );
      }

    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchJourneys();

  return () => {
    cancelled = true;
  };
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