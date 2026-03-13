"use client";

import { useEffect, useState } from "react";

const texts = [
  "Validate ideas instantly",
  "AI-powered insights",
  "Investor-ready reports",
  "Smart validation scoring",
];

export default function TypingText() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    const typingSpeed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(currentText.slice(0, displayed.length + 1));

        if (displayed === currentText) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setDisplayed(currentText.slice(0, displayed.length - 1));

        if (displayed === "") {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, textIndex]);

  return (
    <div className="mt-12 text-2xl font-semibold text-gray-900">
      {displayed}
      <span className="animate-pulse">|</span>
    </div>
  );
}
