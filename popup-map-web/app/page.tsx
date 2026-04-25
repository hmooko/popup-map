"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { MapPanel } from "@/components/map/MapPanel";
import { FilterBar } from "@/components/popup/FilterBar";
import { PopupList } from "@/components/popup/PopupList";
import { mockPopups } from "@/data/mockPopups";
import { getPopupStatus, isOpenToday } from "@/lib/popupStatus";
import type { Popup, PopupFilters } from "@/types/popup";

const initialFilters: PopupFilters = {
  region: "ALL",
  category: "ALL",
  status: "ALL",
  freeOnly: false,
  reservationFreeOnly: false
};

export default function Home() {
  const [filters, setFilters] = useState<PopupFilters>(initialFilters);
  const [query, setQuery] = useState("");
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(mockPopups[0]);

  const filteredPopups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockPopups
      .filter((popup) => popup.visible)
      .filter((popup) => isOpenToday(popup))
      .filter((popup) => filters.region === "ALL" || popup.region === filters.region)
      .filter((popup) => filters.category === "ALL" || popup.category === filters.category)
      .filter((popup) => filters.status === "ALL" || getPopupStatus(popup) === filters.status)
      .filter((popup) => !filters.freeOnly || popup.freeAdmission)
      .filter((popup) => !filters.reservationFreeOnly || !popup.reservationRequired)
      .filter((popup) => {
        if (!normalizedQuery) {
          return true;
        }

        return [popup.title, popup.brandName, popup.address]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [filters, query]);

  function handleSelect(popup: Popup) {
    setSelectedPopup(popup);
  }

  const visibleSelectedPopup =
    selectedPopup && filteredPopups.some((popup) => popup.id === selectedPopup.id)
      ? selectedPopup
      : filteredPopups[0] ?? null;

  return (
    <main className="app-shell">
      <header className="top-header">
        <a className="brand" href="/">
          Popup Map
        </a>
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="지역, 브랜드, 팝업명 검색"
          />
        </label>
        <a className="admin-link" href="/admin/popups/new">
          <ShieldCheck size={16} />
          관리자
        </a>
      </header>

      <div className="main-grid">
        <aside className="side-panel">
          <FilterBar filters={filters} onChange={setFilters} />
          <PopupList
            popups={filteredPopups}
            selectedPopup={visibleSelectedPopup}
            onSelect={handleSelect}
          />
        </aside>
        <MapPanel
          popups={filteredPopups}
          selectedPopup={visibleSelectedPopup}
          onSelect={handleSelect}
        />
      </div>
    </main>
  );
}
