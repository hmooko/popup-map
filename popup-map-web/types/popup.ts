export type Region =
  | "SEONGSU"
  | "HONGDAE"
  | "GANGNAM"
  | "HANNAM"
  | "JAMSIL"
  | "YEOUIDO";

export type Category =
  | "FASHION"
  | "BEAUTY"
  | "CHARACTER"
  | "FOOD"
  | "BAKERY"
  | "ART"
  | "LIFESTYLE"
  | "TECH";

export interface Popup {
  id: number;
  title: string;
  brandName: string;
  description: string;
  category: Category;
  region: Region;
  address: string;
  detailAddress: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  openingHours: string;
  reservationRequired: boolean;
  freeAdmission: boolean;
  entryFee: number | null;
  officialUrl: string | null;
  reservationUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailColor: string;
  visible: boolean;
}

export type PopupDatePreset = "ALL" | "OPEN_TODAY" | "UPCOMING" | "CUSTOM_RANGE";

export interface PopupFilters {
  region: Region | "ALL";
  category: Category | "ALL";
  datePreset: PopupDatePreset;
  dateFrom: string;
  dateTo: string;
  freeOnly: boolean;
  reservationFreeOnly: boolean;
}
