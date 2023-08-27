import parseISO from "date-fns/parseISO";
export const parseISODatestring = (date: string): string =>
  new Date(parseISO(date)).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
