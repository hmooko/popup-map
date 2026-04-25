"use client";

import { ExternalLink, Ticket } from "lucide-react";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { Popup } from "@/types/popup";

interface SelectedPopupPanelProps {
  popup: Popup;
}

export function SelectedPopupPanel({ popup }: SelectedPopupPanelProps) {
  return (
    <article className="selected-panel">
      <div className="selected-image" style={{ background: popup.thumbnailColor }} />
      <div className="card-kicker">
        {categoryLabels[popup.category]} · {regionLabels[popup.region]}
      </div>
      <h3>{popup.title}</h3>
      <p>{popup.description}</p>
      <div className="detail-grid">
        <span>운영</span>
        <strong>
          {popup.startDate} - {popup.endDate}
        </strong>
        <span>시간</span>
        <strong>{popup.openingHours}</strong>
        <span>입장</span>
        <strong>{popup.freeAdmission ? "무료" : `${popup.entryFee?.toLocaleString()}원`}</strong>
        <span>예약</span>
        <strong>{popup.reservationRequired ? "필요" : "불필요"}</strong>
      </div>
      <a className="primary-action" href={popup.reservationUrl ?? popup.officialUrl ?? "#"}>
        <Ticket size={16} />
        상세 보기
        <ExternalLink size={15} />
      </a>
    </article>
  );
}
