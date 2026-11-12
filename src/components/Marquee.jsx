
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/marquee-items`;

export default function Marquee() {
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTechnologies = async () => {
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
            throw new Error(`API error: ${response.status}`);
          }

          const result = await response.json();

          const data = Array.isArray(result)
            ? result
            : result.data;

          if (!Array.isArray(data)) {
            throw new Error("Invalid marquee API response.");
          }

          if (!cancelled) {
            setTechnologies(data);
          }

          return;

        } catch (error) {
          if (attempt === 2 && !cancelled) {
            console.error("Marquee API error:", error);
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

    fetchTechnologies();

    return () => {
      cancelled = true;
    };
  }, []);

  if (technologies.length === 0) {
    return null;
  }

  return (
    <section className="tech-marquee" aria-label="Technologies">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div
            className="marquee-group"
            key={copy}
            aria-hidden={copy === 1}
          >
            {technologies.map((item) => (
              <div className="marquee-item" key={`${copy}-${item.id}`}>
                <span>{item.technology}</span>
                <span className="marquee-diamond">◆</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
