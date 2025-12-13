import { type FC } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import "./Toggle.scss";

interface ToggleProps {
  items: {value: string, id: string}[];
}

export const Toggle: FC<ToggleProps> = ({ items }) => {
  return (
    <ToggleGroup.Root
      className="toggleGroup"
      type="single"
      defaultValue={items[0].value}
    >
      {items.map((item) => {
        return (
          <ToggleGroup.Item key={item.id} className="toggleGroupItem" value={item.value}>
            {item.value}
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
};
