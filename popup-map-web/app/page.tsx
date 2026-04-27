"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { MapPanel } from "@/components/map/MapPanel";
import { FilterBar } from "@/components/popup/FilterBar";
import { PopupList } from "@/components/popup/PopupList";
import { mockPopups } from "@/data/mockPopups";
import { fetchPopups, getApiBaseUrl } from "@/lib/api";
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
  const [popups, setPopups] = useState<Popup[]>(mockPopups);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [apiState, setApiState] = useState<"loading" | "connected" | "fallback">("loading");

  useEffect(() => {
    let active = true;

    fetchPopups()
      .then((apiPopups) => {
        if (!active) {
          return;
        }

        setPopups(apiPopups);
        setSelectedPopup(null);
        setApiState("connected");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPopups(mockPopups);
        setSelectedPopup(null);
        setApiState("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPopups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return popups
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
  }, [filters, popups, query]);

  useEffect(() => {
    if (filteredPopups.length === 0) {
      setSelectedPopup(null);
      return;
    }

    if (!selectedPopup || !filteredPopups.some((popup) => popup.id === selectedPopup.id)) {
      setSelectedPopup(filteredPopups[0]);
    }
  }, [filteredPopups, selectedPopup]);

  function handleSelect(popup: Popup) {
    setSelectedPopup(popup);
  }

  const visibleSelectedPopup =
    selectedPopup && filteredPopups.some((popup) => popup.id === selectedPopup.id)
      ? selectedPopup
      : null;

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

      <div className="mobile-quick-filters" aria-label="모바일 빠른 필터">
        <button className="chip active" type="button">
          오늘 운영
        </button>
        <button
          className={filters.region === "SEONGSU" ? "chip active-soft" : "chip"}
          type="button"
          onClick={() =>
            setFilters((current) => ({
              ...current,
              region: current.region === "SEONGSU" ? "ALL" : "SEONGSU"
            }))
          }
        >
          성수
        </button>
        <button
          className={filters.freeOnly ? "chip active-soft" : "chip"}
          type="button"
          onClick={() =>
            setFilters((current) => ({
              ...current,
              freeOnly: !current.freeOnly
            }))
          }
        >
          무료
        </button>
      </div>

      <div className="main-grid">
        <aside className="side-panel">
          <div className={apiState === "connected" ? "api-state connected" : "api-state"}>
            <span>{apiState === "connected" ? "API 연결됨" : "mock 데이터 사용 중"}</span>
            <strong>{getApiBaseUrl()}</strong>
          </div>
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
