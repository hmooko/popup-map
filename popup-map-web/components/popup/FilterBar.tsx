"use client";

import { SlidersHorizontal } from "lucide-react";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { Category, PopupDatePreset, PopupFilters, Region } from "@/types/popup";

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
const datePresets: Array<{ value: PopupDatePreset; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "OPEN_TODAY", label: "오늘 운영" },
  { value: "UPCOMING", label: "오픈 예정" },
  { value: "CUSTOM_RANGE", label: "기간 지정" }
];

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
          일정 기준
          <select
            value={filters.datePreset}
            onChange={(event) =>
              onChange({
                ...filters,
                datePreset: event.target.value as PopupDatePreset,
                dateFrom: event.target.value === "CUSTOM_RANGE" ? filters.dateFrom : "",
                dateTo: event.target.value === "CUSTOM_RANGE" ? filters.dateTo : ""
              })
            }
          >
            {datePresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filters.datePreset === "CUSTOM_RANGE" ? (
        <div className="filter-grid">
          <label>
            시작일
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
            />
          </label>

          <label>
            종료일
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
            />
          </label>
        </div>
      ) : null}

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
