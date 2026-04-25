"use client";

import type { Popup } from "@/types/popup";
import { PopupCard } from "./PopupCard";

interface PopupListProps {
  popups: Popup[];
  selectedPopup: Popup | null;
  onSelect: (popup: Popup) => void;
}

export function PopupList({ popups, selectedPopup, onSelect }: PopupListProps) {
  return (
    <section className="popup-list" aria-label="팝업 목록">
      <div className="section-heading">
        <div>
          <h2>오늘 갈 수 있는 팝업</h2>
          <p>서울 주요 상권에서 운영 중인 팝업스토어를 빠르게 확인하세요.</p>
        </div>
        <span>{popups.length}개</span>
      </div>

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
