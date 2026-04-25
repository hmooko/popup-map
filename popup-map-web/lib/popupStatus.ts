import type { Popup, PopupStatus } from "@/types/popup";

const today = new Date("2026-04-25T00:00:00");

export function getPopupStatus(popup: Popup): PopupStatus {
  const startDate = new Date(`${popup.startDate}T00:00:00`);
  const endDate = new Date(`${popup.endDate}T00:00:00`);
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (startDate > today) {
    return "UPCOMING";
  }

  if (endDate >= today && daysUntilEnd <= 7) {
    return "CLOSING_SOON";
  }

  return "ONGOING";
}

export function isOpenToday(popup: Popup) {
  const startDate = new Date(`${popup.startDate}T00:00:00`);
  const endDate = new Date(`${popup.endDate}T00:00:00`);

  return startDate <= today && today <= endDate;
}
