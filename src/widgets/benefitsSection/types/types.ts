import type { FC, SVGProps } from "react";

interface BenefitItem {
  id: string;
  text: string;
  isActive: boolean;
}

export interface BenefitCard {
  id: string;
  title: string;
  description: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  bgIcon: FC<SVGProps<SVGSVGElement>>;
  cardList: BenefitItem[];
}
