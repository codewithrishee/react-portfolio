import { useEffect, useState } from "react";

export default function Marquee() {
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/marquee-items`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch technologies");
        }

        const data = await response.json();
        setTechnologies(data);
      } catch (error) {
        console.error("Marquee API error:", error);
      }
    };

    fetchTechnologies();
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