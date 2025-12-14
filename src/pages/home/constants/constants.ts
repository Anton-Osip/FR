import { mockData } from "@widgets/Carousel/mockData";
import { ReactComponent as FireIcon } from "@assets/icons/fire.svg";
import { ReactComponent as SevenIcon } from "@assets/icons/77.svg";
import { ReactComponent as MicoIcon } from "@assets/icons/microphone-2.svg";
import { ReactComponent as FlashIcon } from "@assets/icons/flash.svg";

export const carouselData = [
  {
    icon: FireIcon,
    title: "Популярное",
    items: mockData,
  },
  {
    icon: SevenIcon,
    title: "Слоты",
    items: mockData,
  },
  {
    icon: MicoIcon,
    title: "Live-игры",
    items: mockData,
  },
  {
    icon: FlashIcon,
    title: "Быстрые игры",
    items: mockData,
  },
];
