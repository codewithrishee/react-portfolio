import { useEffect, useState } from "react";

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    let completionTimer;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const value = Math.min(
        Math.floor((elapsed / duration) * 100),
        100
      );

      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);
        completionTimer = setTimeout(onComplete, 150);
      }
    }, 20);

    return () => {
      clearInterval(timer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="preloader">
      <div className="preloader-inner">
        <div className="preloader-top">
          <span className="preloader-name">
            VIJAY Kumar<span className="preloader-dot">.</span>
          </span>

          <span className="preloader-percent">
            {String(progress).padStart(3, "0")}%
          </span>
        </div>

        <div className="preloader-line">
          <div
            className="preloader-line-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="preloader-bottom">
          <span>FULL STACK DEVELOPER</span>
          <span>DELHI, INDIA</span>
        </div>
      </div>
    </div>
  );
}