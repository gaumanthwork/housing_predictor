export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const compactMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
export const number = new Intl.NumberFormat("en-US");
export const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
