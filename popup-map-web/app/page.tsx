"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPanel } from "@/components/map/MapPanel";
import { FilterBar } from "@/components/popup/FilterBar";
import { PopupList } from "@/components/popup/PopupList";
import { fetchMapPopupIds, fetchPopups, getApiBaseUrl, type MapBounds } from "@/lib/api";
import type { Popup, PopupFilters } from "@/types/popup";

const initialFilters: PopupFilters = {
  region: "ALL",
  category: "ALL",
  status: "ALL",
  freeOnly: false,
  reservationFreeOnly: false
};

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PopupFilters>(initialFilters);
  const [query, setQuery] = useState("");
  const [allPopups, setAllPopups] = useState<Popup[]>([]);
  const [visiblePopupIds, setVisiblePopupIds] = useState<number[] | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [apiState, setApiState] = useState<"loading" | "connected" | "error">("loading");
  const [apiMessage, setApiMessage] = useState("팝업 목록을 불러오는 중입니다.");
  const [mapSearchLoading, setMapSearchLoading] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPopups()
      .then((apiPopups) => {
        if (!active) {
          return;
        }

        setAllPopups(apiPopups);
        setSelectedPopup(null);
        setApiState("connected");
        setApiMessage("실시간 API 데이터를 불러왔습니다.");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        const nextMessage =
          error instanceof Error
            ? error.message
            : "팝업 API에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.";

        setAllPopups([]);
        setSelectedPopup(null);
        setApiState("error");
        setApiMessage(nextMessage);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSearchInView(bounds: MapBounds) {
    setMapSearchLoading(true);

    try {
      const popupIds = await fetchMapPopupIds(bounds);
      setVisiblePopupIds(popupIds);
    } catch {
      setVisiblePopupIds(null);
    } finally {
      setMapSearchLoading(false);
    }
  }

  const popups = useMemo(() => {
    if (visiblePopupIds === null) {
      return allPopups;
    }

    const idSet = new Set(visiblePopupIds);
    return allPopups.filter((popup) => idSet.has(popup.id));
  }, [allPopups, visiblePopupIds]);

  const filteredPopups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return popups
      .filter((popup) => popup.visible)
      .filter((popup) => filters.region === "ALL" || popup.region === filters.region)
      .filter((popup) => filters.category === "ALL" || popup.category === filters.category)
      .filter((popup) => filters.status === "ALL" || popup.status === filters.status)
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

  const requestedPopupIdParam = searchParams.get("popupId");
  const requestedPopupId =
    requestedPopupIdParam === null ? null : Number.parseInt(requestedPopupIdParam, 10);

  useEffect(() => {
    if (filteredPopups.length === 0) {
      setSelectedPopup(null);
      return;
    }

    if (requestedPopupId !== null && Number.isInteger(requestedPopupId)) {
      const requestedPopup = filteredPopups.find((popup) => popup.id === requestedPopupId);

      if (requestedPopup) {
        if (selectedPopup?.id !== requestedPopup.id) {
          setSelectedPopup(requestedPopup);
        }
        return;
      }
    }

    if (!selectedPopup || !filteredPopups.some((popup) => popup.id === selectedPopup.id)) {
      setSelectedPopup(filteredPopups[0]);
    }
  }, [filteredPopups, requestedPopupId, selectedPopup]);

  useEffect(() => {
    const currentPopupId = searchParams.get("popupId");
    const nextPopupId = selectedPopup ? String(selectedPopup.id) : null;

    if (currentPopupId === nextPopupId || (!currentPopupId && nextPopupId === null)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextPopupId) {
      nextSearchParams.set("popupId", nextPopupId);
    } else {
      nextSearchParams.delete("popupId");
    }

    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, selectedPopup]);

  function handleSelect(popup: Popup) {
    setSelectedPopup(popup);
  }

  const visibleSelectedPopup =
    selectedPopup && filteredPopups.some((popup) => popup.id === selectedPopup.id)
      ? selectedPopup
      : null;
  const emptyMessage =
    apiState === "loading"
      ? "팝업을 불러오는 중입니다."
      : apiState === "error"
        ? "팝업 API에 연결하지 못했습니다."
        : "조건에 맞는 팝업이 없습니다.";

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
          <div
            className={apiState === "connected" ? "api-state connected" : "api-state"}
            role="status"
          >
            <span>
              {apiState === "connected"
                ? "API 연결됨"
                : apiState === "loading"
                  ? "API 연결 확인 중"
                  : "API 연결 실패"}
            </span>
            <p>{apiMessage}</p>
            <strong>{getApiBaseUrl()}</strong>
          </div>
          <FilterBar filters={filters} onChange={setFilters} />
          <PopupList
            popups={filteredPopups}
            selectedPopup={visibleSelectedPopup}
            onSelect={handleSelect}
            emptyMessage={emptyMessage}
          />
        </aside>
        <MapPanel
          popups={filteredPopups}
          selectedPopup={visibleSelectedPopup}
          onSelect={handleSelect}
          onSearchInView={handleSearchInView}
          searchInViewLoading={mapSearchLoading}
        />
      </div>
    </main>
  );
}
