"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import type { Popup } from "@/types/popup";
import { PopupCard } from "./PopupCard";
import { SelectedPopupPanel } from "./SelectedPopupPanel";

interface PopupListProps {
  popups: Popup[];
  selectedPopup: Popup | null;
  onSelect: (popup: Popup) => void;
}

type SheetState = "collapsed" | "full";

export function PopupList({ popups, selectedPopup, onSelect }: PopupListProps) {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const dragStartYRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);

  const sheetLabel = sheetState === "collapsed" ? "팝업 목록 전체로 열기" : "팝업 목록 접기";

  function handleSheetPointerDown(event: PointerEvent<HTMLButtonElement>) {
    dragStartYRef.current = event.clientY;
    dragMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (dragStartYRef.current === null) {
      return;
    }

    if (Math.abs(event.clientY - dragStartYRef.current) > 8) {
      dragMovedRef.current = true;
    }
  }

  function handleSheetPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (dragStartYRef.current === null) {
      return;
    }

    const dragDistance = event.clientY - dragStartYRef.current;

    if (dragDistance > 32) {
      setSheetState("collapsed");
    }

    if (dragDistance < -32) {
      setSheetState("full");
    }

    dragStartYRef.current = null;
  }

  function handleSheetToggle() {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    setSheetState((current) => (current === "collapsed" ? "full" : "collapsed"));
  }

  return (
    <section
      className={`popup-list sheet-${sheetState}`}
      aria-label="팝업 목록"
    >
      <button
        className="sheet-handle"
        type="button"
        aria-label={sheetLabel}
        aria-expanded={sheetState !== "collapsed"}
        onClick={handleSheetToggle}
        onPointerDown={handleSheetPointerDown}
        onPointerMove={handleSheetPointerMove}
        onPointerUp={handleSheetPointerUp}
      >
        {sheetState === "full" ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
      </button>

      <div className="section-heading">
        <div>
          <h2>오늘 갈 수 있는 팝업</h2>
          <p>서울 주요 상권에서 운영 중인 팝업스토어를 빠르게 확인하세요.</p>
        </div>
        <span>{popups.length}개</span>
      </div>

      {selectedPopup ? (
        <div className="sheet-selected-card">
          <SelectedPopupPanel popup={selectedPopup} />
        </div>
      ) : null}

      <div className="cards-stack">
        {popups.length > 0 ? (
          popups.map((popup) => (
            <PopupCard
              key={popup.id}
              popup={popup}
              selected={selectedPopup?.id === popup.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="empty-state">조건에 맞는 팝업이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
