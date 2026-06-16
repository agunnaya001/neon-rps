import { formatEther } from "viem";
import { useEthPrice, formatUsd } from "@/lib/useEthPrice";

interface EthAmountProps {
  wei: bigint;
  className?: string;
  usdClassName?: string;
  showUsd?: boolean;
  inline?: boolean;
}

export function EthAmount({
  wei,
  className = "",
  usdClassName = "",
  showUsd = true,
  inline = true,
}: EthAmountProps) {
  const { data: ethPrice } = useEthPrice();
  const eth = formatEther(wei);
  const usd = showUsd ? formatUsd(wei, ethPrice) : null;

  if (inline) {
    return (
      <span className={className}>
        {eth} ETH
        {usd && (
          <span className={`text-muted-foreground ml-1 text-[0.8em] ${usdClassName}`}>
            ({usd})
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`flex flex-col items-end ${className}`}>
      <span>{eth} ETH</span>
      {usd && (
        <span className={`text-muted-foreground text-[0.75em] ${usdClassName}`}>
          {usd}
        </span>
      )}
    </span>
  );
}
