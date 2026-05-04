"use client";

import { CalendarDays, Clock3, ExternalLink, MapPin, Ticket } from "lucide-react";
import { ShareLinkButton } from "@/components/common/ShareLinkButton";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { Popup } from "@/types/popup";

interface SelectedPopupPanelProps {
  popup: Popup;
}

export function SelectedPopupPanel({ popup }: SelectedPopupPanelProps) {
  const fullAddress = popup.detailAddress ? `${popup.address} ${popup.detailAddress}` : popup.address;
  const admissionLabel = popup.freeAdmission ? "무료 입장" : `${popup.entryFee?.toLocaleString()}원`;
  const reservationLabel = popup.reservationRequired ? "예약 필요" : "예약 없이 입장";
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set("popupId", String(popup.id));

  return (
    <article className="selected-panel">
      <div className="selected-image" style={{ background: popup.thumbnailColor }}>
        {popup.thumbnailUrl ? (
          <img
            className="selected-image-tag"
            src={popup.thumbnailUrl}
            alt={`${popup.title} 대표 이미지`}
          />
        ) : null}
      </div>
      <div className="selected-panel-top">
        <div className="card-kicker">
          {categoryLabels[popup.category]} · {regionLabels[popup.region]}
        </div>
        <ShareLinkButton
          className="selected-share-button"
          feedbackClassName="selected-share-feedback"
          feedbackMode="inline"
          shareText={`${popup.title} 팝업 링크`}
          title={popup.title}
          url={shareUrl.toString()}
        />
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
      <a
        className={popup.officialUrl ? "primary-action" : "primary-action disabled"}
        href={popup.officialUrl ?? undefined}
        target={popup.officialUrl ? "_blank" : undefined}
        rel={popup.officialUrl ? "noreferrer" : undefined}
        aria-disabled={popup.officialUrl ? undefined : true}
        onClick={(event) => {
          if (!popup.officialUrl) {
            event.preventDefault();
          }
        }}
      >
        <Ticket size={16} />
        상세 보기
        <ExternalLink size={15} />
      </a>
    </article>
  );
}
