import { type FC } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import "./AppSelect.scss";

interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  disabled?: boolean;
}

export const AppSelect: FC<AppSelectProps> = ({
  value,
  onValueChange,
  items,
  disabled = false,
}) => {
  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger className="selectRoot">
        <Select.Value />
        <Select.Icon className="selectIcon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Content className="selectContent">
        {items.map((item) => (
          <Select.Item
            key={item.value}
            value={item.value}
            className="selectItem"
          >
            <div className="selectItemCircle">
              <Select.ItemIndicator className="selectItemIndicator">
                <span />
              </Select.ItemIndicator>
            </div>
            <Select.ItemText>{item.label}</Select.ItemText>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
