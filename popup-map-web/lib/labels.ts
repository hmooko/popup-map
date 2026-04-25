import type { Category, PopupStatus, Region } from "@/types/popup";

export const regionLabels: Record<Region, string> = {
  SEONGSU: "성수",
  HONGDAE: "홍대",
  GANGNAM: "강남",
  HANNAM: "한남",
  JAMSIL: "잠실",
  YEOUIDO: "여의도"
};

export const categoryLabels: Record<Category, string> = {
  FASHION: "패션",
  BEAUTY: "뷰티",
  CHARACTER: "캐릭터",
  FOOD: "푸드",
  BAKERY: "베이커리",
  ART: "아트",
  LIFESTYLE: "라이프스타일",
  TECH: "테크"
};

export const statusLabels: Record<PopupStatus, string> = {
  ONGOING: "오늘 운영 중",
  UPCOMING: "오픈 예정",
  CLOSING_SOON: "종료 임박"
};
