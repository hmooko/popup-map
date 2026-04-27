"use client";

import { CalendarDays, ChevronRight, Clock3, MapPin, Ticket } from "lucide-react";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { Popup } from "@/types/popup";

interface SelectedPopupPanelProps {
  popup: Popup;
}

export function SelectedPopupPanel({ popup }: SelectedPopupPanelProps) {
  const fullAddress = popup.detailAddress ? `${popup.address} ${popup.detailAddress}` : popup.address;
  const admissionLabel = popup.freeAdmission ? "무료 입장" : `${popup.entryFee?.toLocaleString()}원`;
  const reservationLabel = popup.reservationRequired ? "예약 필요" : "예약 없이 입장";

  return (
    <article className="selected-panel">
      <div className="selected-image" style={{ background: popup.thumbnailColor }} />
      <div className="card-kicker">
        {categoryLabels[popup.category]} · {regionLabels[popup.region]}
      </div>
      <h3>{popup.title}</h3>
      <p>{popup.description}</p>
      <div className="selected-mobile-meta">
        <span>
          <CalendarDays size={13} />
          {popup.startDate.slice(5).replace("-", ".")} - {popup.endDate.slice(5).replace("-", ".")}
        </span>
        <span>
          <Clock3 size={13} />
          {popup.openingHours}
        </span>
        <span>
          <MapPin size={13} />
          {fullAddress}
        </span>
      </div>
      <div className="selected-mobile-tags">
        <span>{admissionLabel}</span>
        <span>{reservationLabel}</span>
      </div>
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
        <span>주소</span>
        <strong>{fullAddress}</strong>
      </div>
      <a className="primary-action" href={`/popups/${popup.id}`}>
        <Ticket size={16} />
        상세 보기
        <ChevronRight size={15} />
      </a>
    </article>
  );
}
