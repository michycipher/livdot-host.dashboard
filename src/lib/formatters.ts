export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }).format(new Date(value)) + " WAT"
    : "Not scheduled";
}
export function formatCurrency(price: number | null, currency: string) {
  return price === null
    ? "Not configured"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(price);
}
