import { useState, useEffect } from "react";
import type { CarouselItemProps } from "../types/types";

interface UseCarouselProps {
  items: CarouselItemProps[];
  maxItems: number;
}

export const useCarousel = ({ items, maxItems }: UseCarouselProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animatingItemIndex, setAnimatingItemIndex] = useState<number | null>(null);

  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const SWIPE_THRESHOLD = 50;

  const handleNext = () => {
    if (startIndex + maxItems < items.length) {
      setDirection("right");
      setAnimatingItemIndex(maxItems - 1);
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setDirection("left");
      setAnimatingItemIndex(0);
      setStartIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (animatingItemIndex !== null) {
      const timer = setTimeout(() => {
        setAnimatingItemIndex(null);
        setDirection(null);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [animatingItemIndex]);

  const visibleItems = items.slice(startIndex, startIndex + maxItems);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    setDragOffsetX(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (dragOffsetX < -SWIPE_THRESHOLD) handleNext();
    else if (dragOffsetX > SWIPE_THRESHOLD) handlePrev();

    setDragOffsetX(0);
    setDragStartX(null);
  };

  return {
    visibleItems,
    direction,
    animatingItemIndex,
    dragOffsetX,
    isDragging,
    handleNext,
    handlePrev,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
