import { mapPopupApiItem, type PopupApiItem } from "@/lib/popupMapper";
import { addDays, formatDateParam } from "@/lib/popupDates";
import type { Popup, PopupFilters } from "@/types/popup";

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

function buildPopupSearchParams(filters?: PopupFilters) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", "0");
  searchParams.set("size", "50");

  if (!filters) {
    return searchParams;
  }

  if (filters.region !== "ALL") {
    searchParams.set("region", filters.region);
  }

  if (filters.category !== "ALL") {
    searchParams.set("category", filters.category);
  }

  if (filters.freeOnly) {
    searchParams.set("freeOnly", "true");
  }

  if (filters.reservationFreeOnly) {
    searchParams.set("reservationRequired", "false");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filters.datePreset === "OPEN_TODAY") {
    searchParams.set("openOnDate", formatDateParam(today));
  }

  if (filters.datePreset === "UPCOMING") {
    searchParams.set("startDateFrom", formatDateParam(addDays(today, 1)));
  }

  if (filters.datePreset === "CUSTOM_RANGE") {
    if (filters.dateFrom) {
      searchParams.set("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
      searchParams.set("dateTo", filters.dateTo);
    }
  }

  return searchParams;
}

export async function fetchPopups(filters?: PopupFilters): Promise<Popup[]> {
  const response = await fetch(`/api/popups?${buildPopupSearchParams(filters).toString()}`, {
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
