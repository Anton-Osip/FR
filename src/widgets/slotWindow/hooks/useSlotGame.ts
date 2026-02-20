import { useState } from 'react';

interface UseSlotGameReturn {
  isTheatreMode: boolean;
  toggleTheatreMode: () => void;
}

export const useSlotGame = (): UseSlotGameReturn => {
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(false);

  const toggleTheatreMode = (): void => {
    setIsTheatreMode(prev => !prev);
  };

  return {
    toggleTheatreMode,
    isTheatreMode,
  };
};
