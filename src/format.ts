const coinFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCoins(coins: number): string {
  const sign = coins < 0 ? "-" : "";
  return `${sign}Ǥ${coinFormatter.format(Math.abs(coins))}`;
}

export function formatAccount(name: string, balanceCoins: number): string {
  return `${name} ${formatCoins(balanceCoins)}`;
}

export type PriceTrend = "up" | "down";

export type WareMarketItem = {
  name: string;
  price: string;
  trend: PriceTrend | null;
};

export function buildWareMarketItem(
  name: string,
  priceCoins: number,
  trend?: PriceTrend
): WareMarketItem {
  const arrow = trend === "up" ? "▲ " : trend === "down" ? "▼ " : "";
  return {
    name,
    price: `${arrow}${formatCoins(priceCoins)}`,
    trend: trend ?? null,
  };
}
