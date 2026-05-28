const coinFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCoins(coins: number): string {
  return `Ǥ${coinFormatter.format(coins)}`;
}

export function formatPriceCents(priceCents: number): string {
  const value = priceCents / 100;
  return `Ǥ${priceFormatter.format(value)}`;
}

export function formatAccount(name: string, balanceCoins: number): string {
  return `${name} ${formatCoins(balanceCoins)}`;
}

export function formatWare(name: string, priceCents: number): string {
  return `${name} ${formatPriceCents(priceCents)}`;
}

