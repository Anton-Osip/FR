import { Carousel } from "@widgets/Carousel";
import { mockData } from "@widgets/Carousel/mockData";
import { ReactComponent as FireIcon } from "@assets/icons/fire.svg";

export const HomePage = () => {
  return (
    <>
      <Carousel icon={FireIcon} title="Популярное" items={mockData} />
    </>
  );
};
