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

export type PopupStatus = "ONGOING" | "UPCOMING" | "CLOSING_SOON";

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
  thumbnailColor: string;
  visible: boolean;
}

export interface PopupFilters {
  region: Region | "ALL";
  category: Category | "ALL";
  status: PopupStatus | "ALL";
  freeOnly: boolean;
  reservationFreeOnly: boolean;
}
