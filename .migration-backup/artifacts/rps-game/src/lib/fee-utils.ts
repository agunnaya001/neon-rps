export const FEE_BPS = 250;
export const FEE_PERCENT = FEE_BPS / 100;

export function winnerPayout(betAmount: bigint, feeBps: bigint): bigint {
  const pot = betAmount * 2n;
  const fee = (pot * feeBps) / 10000n;
  return pot - fee;
}

export function feeOnWin(betAmount: bigint, feeBps: bigint): bigint {
  const pot = betAmount * 2n;
  return (pot * feeBps) / 10000n;
}

export function formatEth(wei: bigint, decimals = 4): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(decimals).replace(/\.?0+$/, "") || "0";
}
