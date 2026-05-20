export function formatINR(paise: number, currency = "INR"): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatINRCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10_000_000) {
    return `₹${(rupees / 10_000_000).toFixed(2)} Cr`;
  }
  if (rupees >= 100_000) {
    return `₹${(rupees / 100_000).toFixed(2)} L`;
  }
  return formatINR(paise);
}
