import { mapPopupApiItem, type PopupApiItem } from "@/lib/popupMapper";
import type { Popup } from "@/types/popup";

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

export interface MapBounds {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
}

interface PopupMapApiItem {
  id: number;
}

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

  return data.content.map((popup, index) => mapPopupApiItem(popup, index));
}

export async function fetchMapPopupIds(bounds: MapBounds): Promise<number[]> {
  const searchParams = new URLSearchParams({
    southWestLat: String(bounds.southWestLat),
    southWestLng: String(bounds.southWestLng),
    northEastLat: String(bounds.northEastLat),
    northEastLng: String(bounds.northEastLng)
  });

  const response = await fetch(`/api/popups/map?${searchParams.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`지도 팝업 조회 실패: ${response.status}`);
  }

  const data = (await response.json()) as PopupMapApiItem[];

  return data.map((popup) => popup.id);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
