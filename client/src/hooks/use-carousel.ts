import { useState } from "react";

export function useCarousel(totalItems: number) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex(prev => (prev + 1) % totalItems);
  };

  const prev = () => {
    setCurrentIndex(prev => (prev - 1 + totalItems) % totalItems);
  };

  const setIndex = (index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  return { currentIndex, next, prev, setIndex };
}
