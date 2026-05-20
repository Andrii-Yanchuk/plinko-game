import Image from "next/image";
import { formatCredits } from "./formatters";

type CreditAmountProps = {
  value: string;
};

export function CreditAmount({ value }: CreditAmountProps) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold ">
      <Image src="./balance-icon.svg" alt="bet-icon" width={12} height={12} />
      {formatCredits(value)}
    </span>
  );
}
