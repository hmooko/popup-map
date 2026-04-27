"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { categoryLabels, regionLabels, statusLabels } from "@/lib/labels";
import type { Popup } from "@/types/popup";

interface PopupCardProps {
  popup: Popup;
  selected: boolean;
  onSelect: (popup: Popup) => void;
}

export function PopupCard({ popup, selected, onSelect }: PopupCardProps) {
  return (
    <button
      className={selected ? "popup-card selected" : "popup-card"}
      type="button"
      onClick={() => onSelect(popup)}
    >
      <div className="popup-thumb" style={{ background: popup.thumbnailColor }} />
      <div className="popup-card-body">
        <div className="card-kicker">
          {categoryLabels[popup.category]} · {regionLabels[popup.region]}
        </div>
        <strong>{popup.title}</strong>
        <span className="muted-line">
          <CalendarDays size={13} />
          {popup.startDate.slice(5).replace("-", ".")} -{" "}
          {popup.endDate.slice(5).replace("-", ".")}
        </span>
        <span className="muted-line">
          <MapPin size={13} />
          {statusLabels[popup.status]}
        </span>
      </div>
    </button>
  );
}
