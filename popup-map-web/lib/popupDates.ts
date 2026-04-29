import type { Popup } from "@/types/popup";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function getPopupScheduleLabel(popup: Popup, baseDate = new Date()) {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const startDate = parseDate(popup.startDate);
  const endDate = parseDate(popup.endDate);

  if (startDate <= today && endDate >= today) {
    return "오늘 운영";
  }

  if (startDate > today) {
    const diffDays = Math.round((startDate.getTime() - today.getTime()) / DAY_IN_MS);
    if (diffDays <= 7) {
      return `${popup.startDate.slice(5).replace("-", ".")} 오픈`;
    }

    return "오픈 예정";
  }

  return "운영 종료";
}
