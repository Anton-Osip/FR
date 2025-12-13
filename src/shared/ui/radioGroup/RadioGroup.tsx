import { useState, type FC } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import "./RadioGroup.scss";

interface RadioProps {
  items: { value: string; id: string }[];
}

export const Radio: FC<RadioProps> = ({ items }) => {
  const [value, setValue] = useState(items[0].value);

  return (
    <form>
      <RadioGroup.Root
        className="radioGroupRoot"
        value={value}
        onValueChange={setValue}
      >
        {items.map((item) => {
          const isChecked = value === item.value;

          return (
            <div
              key={item.id}
              className="radioGroupItemWrapper"
              data-state={isChecked ? "checked" : "unchecked"}
            >
              <RadioGroup.Item
                className="radioGroupItem"
                value={item.value}
                id={item.id}
              />
              <label className="radioGroupLabel" htmlFor={item.id}>
                {item.value}
              </label>
            </div>
          );
        })}
      </RadioGroup.Root>
    </form>
  );
};
