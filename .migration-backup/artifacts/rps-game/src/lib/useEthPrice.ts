import { useQuery } from "@tanstack/react-query";

interface LlamaPrice {
  coins: {
    "coingecko:ethereum": { price: number; symbol: string; timestamp: number };
  };
}

export function useEthPrice() {
  return useQuery<number | null>({
    queryKey: ["eth-usd-price"],
    queryFn: async () => {
      const res = await fetch(
        "https://coins.llama.fi/prices/current/coingecko:ethereum?searchWidth=4h",
        { signal: AbortSignal.timeout(4000) },
      );
      if (!res.ok) return null;
      const data: LlamaPrice = await res.json();
      return data.coins["coingecko:ethereum"]?.price ?? null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function formatUsd(
  wei: bigint,
  ethPriceUsd: number | null | undefined,
): string | null {
  if (!ethPriceUsd || wei === 0n) return null;
  const eth = Number(wei) / 1e18;
  const usd = eth * ethPriceUsd;
  if (usd < 0.005) return "<$0.01";
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 10_000) return `$${usd.toFixed(2)}`;
  return `$${Math.round(usd).toLocaleString()}`;
}
