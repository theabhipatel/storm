const IST_TZ = "Asia/Kolkata";

function parseInput(input: string | number | Date): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date input");
  }
  return d;
}

export function formatDateIST(input: string | number | Date): string {
  const d = parseInput(input);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .replace(/ /g, " ")
    .concat(" IST");
}

export function formatDateShortIST(input: string | number | Date): string {
  const d = parseInput(input);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTimeIST(input: string | number | Date): string {
  const d = parseInput(input);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .replace(/ /g, " ")
    .concat(" IST");
}
