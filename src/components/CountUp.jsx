import { useEffect, useRef, useState } from "react";

/**
 * Animated number that counts up from 0 → `end` on mount.
 *
 * @param {number}  end       – target value (e.g. 6)
 * @param {number}  duration  – animation length in ms (default 1500)
 * @param {string}  suffix    – appended after the number (default "+")
 * @param {number}  pad       – left-pad with zeros to this length (0 = off)
 * @param {number}  delay     – start delay in ms (nice for staggering)
 */
export default function CountUp({
  end,
  duration = 1500,
  suffix = "+",
  pad = 2,
  delay = 0,
}) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    // Respect users who disable motion
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setCount(end);
      return;
    }

    if (started.current) return;
    started.current = true;

    let frameId;
    let startTime = null;
    let delayId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // easeOutCubic — fast start, gentle landing
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // ensure exact final value
      }
    };

    delayId = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [end, duration, delay]);

  const formatted =
    pad > 0 ? String(count).padStart(pad, "0") : String(count);

  return (
    <strong>
      {formatted}
      <span>{suffix}</span>
    </strong>
  );
}