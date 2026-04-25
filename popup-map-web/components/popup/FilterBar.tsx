"use client";

import { SlidersHorizontal } from "lucide-react";
import { categoryLabels, regionLabels, statusLabels } from "@/lib/labels";
import type { Category, PopupFilters, PopupStatus, Region } from "@/types/popup";

interface FilterBarProps {
  filters: PopupFilters;
  onChange: (filters: PopupFilters) => void;
}

const regions: Region[] = ["SEONGSU", "HONGDAE", "GANGNAM", "HANNAM", "JAMSIL", "YEOUIDO"];
const categories: Category[] = [
  "FASHION",
  "BEAUTY",
  "CHARACTER",
  "FOOD",
  "BAKERY",
  "ART",
  "LIFESTYLE",
  "TECH"
];
const statuses: PopupStatus[] = ["ONGOING", "CLOSING_SOON", "UPCOMING"];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <section className="filter-panel" aria-label="팝업 필터">
      <div className="filter-title">
        <SlidersHorizontal size={16} />
        <span>필터</span>
      </div>

      <div className="filter-grid">
        <label>
          지역
          <select
            value={filters.region}
            onChange={(event) =>
              onChange({ ...filters, region: event.target.value as PopupFilters["region"] })
            }
          >
            <option value="ALL">전체</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {regionLabels[region]}
              </option>
            ))}
          </select>
        </label>

        <label>
          카테고리
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value as PopupFilters["category"] })
            }
          >
            <option value="ALL">전체</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label>
          운영 상태
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value as PopupFilters["status"] })
            }
          >
            <option value="ALL">전체</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toggle-row">
        <button
          className={filters.freeOnly ? "chip active" : "chip"}
          type="button"
          onClick={() => onChange({ ...filters, freeOnly: !filters.freeOnly })}
        >
          무료 입장
        </button>
        <button
          className={filters.reservationFreeOnly ? "chip active" : "chip"}
          type="button"
          onClick={() =>
            onChange({ ...filters, reservationFreeOnly: !filters.reservationFreeOnly })
          }
        >
          예약 없이 입장
        </button>
      </div>
    </section>
  );
}
