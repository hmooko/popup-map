import type { Category, Popup, Region } from "@/types/popup";

export interface PopupApiItem {
  id: number;
  title: string;
  brandName: string;
  description?: string | null;
  category: Category;
  region: Region;
  address: string;
  detailAddress?: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  openingHours: string;
  reservationRequired: boolean;
  freeAdmission: boolean;
  entryFee?: number | null;
  officialUrl?: string | null;
  reservationUrl?: string | null;
  thumbnailUrl?: string | null;
  visible?: boolean;
}

const fallbackColors = ["#FDE68A", "#BFDBFE", "#FBCFE8", "#FED7AA", "#BBF7D0"];

export function mapPopupApiItem(popup: PopupApiItem, index = 0): Popup {
  return {
    id: popup.id,
    title: popup.title,
    brandName: popup.brandName,
    description: popup.description ?? "팝업 상세 소개가 준비 중입니다.",
    category: popup.category,
    region: popup.region,
    address: popup.address,
    detailAddress: popup.detailAddress ?? null,
    latitude: popup.latitude,
    longitude: popup.longitude,
    startDate: popup.startDate,
    endDate: popup.endDate,
    openingHours: popup.openingHours,
    reservationRequired: popup.reservationRequired,
    freeAdmission: popup.freeAdmission,
    entryFee: popup.entryFee ?? null,
    officialUrl: popup.officialUrl ?? null,
    reservationUrl: popup.reservationUrl ?? null,
    thumbnailUrl: popup.thumbnailUrl ?? null,
    thumbnailColor: fallbackColors[index % fallbackColors.length],
    visible: popup.visible ?? true
  };
}
