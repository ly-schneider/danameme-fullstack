import React from "react";
import { useInView } from "react-intersection-observer";

export default function LazyImage({ src, alt }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  return (
    <img
      ref={ref}
      src={inView ? src : ""}
      alt={alt}
      className="w-full rounded-image"
      style={{ transition: "opacity 0.3s", opacity: inView ? 1 : 0 }}
    />
  );
}
