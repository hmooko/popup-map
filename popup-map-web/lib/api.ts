import type { Category, Popup, Region } from "@/types/popup";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://popup-map-api.with-momo.com";

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface PopupApiItem {
  id: number;
  title: string;
  brandName: string;
  description?: string | null;
  category: Category;
  region: Region;
  address: string;
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

export async function fetchPopups(): Promise<Popup[]> {
  const response = await fetch("/api/popups", {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`팝업 목록 조회 실패: ${response.status}`);
  }

  const data = (await response.json()) as PageResponse<PopupApiItem>;

  return data.content.map((popup, index) => ({
    id: popup.id,
    title: popup.title,
    brandName: popup.brandName,
    description: popup.description ?? "팝업 상세 소개가 준비 중입니다.",
    category: popup.category,
    region: popup.region,
    address: popup.address,
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
    thumbnailColor: fallbackColors[index % fallbackColors.length],
    visible: popup.visible ?? true
  }));
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
