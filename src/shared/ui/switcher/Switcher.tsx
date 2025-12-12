import { type FC } from "react";
import * as Switch from "@radix-ui/react-switch";
import "./Switcher.scss";

export const Switcher: FC<React.ComponentProps<typeof Switch.Root>> = (
  props
) => {
  return (
    <Switch.Root className="switch" {...props}>
      <Switch.Thumb className="thumb" />
    </Switch.Root>
  );
};
