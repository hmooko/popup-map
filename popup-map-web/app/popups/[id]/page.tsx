import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Ticket } from "lucide-react";
import { notFound } from "next/navigation";
import { ShareLinkButton } from "@/components/common/ShareLinkButton";
import { categoryLabels, regionLabels } from "@/lib/labels";
import { mapPopupApiItem, type PopupApiItem } from "@/lib/popupMapper";
import type { Popup } from "@/types/popup";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

interface PopupDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type PopupFetchResult =
  | { status: "success"; popup: Popup }
  | { status: "not_found" }
  | { status: "error"; message: string };

async function fetchPopup(id: number): Promise<PopupFetchResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/popups/${id}`, {
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (response.status === 404) {
      return { status: "not_found" };
    }

    if (!response.ok) {
      return {
        status: "error",
        message: `팝업 상세 정보를 불러오지 못했습니다. (${response.status})`
      };
    }

    const popup = (await response.json()) as PopupApiItem;
    return {
      status: "success",
      popup: mapPopupApiItem(popup, id)
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "팝업 상세 정보를 불러오지 못했습니다."
    };
  }
}

export default async function PopupDetailPage({ params }: PopupDetailPageProps) {
  const { id } = await params;
  const popupId = Number(id);

  if (!Number.isInteger(popupId)) {
    notFound();
  }

  const popupResult = await fetchPopup(popupId);

  if (popupResult.status === "not_found") {
    notFound();
  }

  if (popupResult.status === "error") {
    return (
      <main className="detail-shell">
        <header className="detail-header">
          <a className="back-link" href="/">
            <ArrowLeft size={16} />
            목록으로
          </a>
          <a className="brand" href="/">
            Popup Map
          </a>
        </header>

        <section className="detail-error-card">
          <h1>상세 정보를 불러오지 못했습니다.</h1>
          <p>{popupResult.message}</p>
          <a className="primary-action detail-error-action" href="/">
            메인으로 돌아가기
          </a>
        </section>
      </main>
    );
  }

  const { popup } = popupResult;

  return (
    <main className="detail-shell">
      <header className="detail-header">
        <a className="back-link" href="/">
          <ArrowLeft size={16} />
          목록으로
        </a>
        <a className="brand" href="/">
          Popup Map
        </a>
      </header>

      <section className="detail-hero">
        <div className="detail-hero-image" style={{ background: popup.thumbnailColor }}>
          {popup.thumbnailUrl ? (
            <img
              className="detail-hero-image-tag"
              src={popup.thumbnailUrl}
              alt={`${popup.title} 대표 이미지`}
            />
          ) : null}
        </div>
        <div className="detail-summary">
          <div className="detail-summary-top">
            <div className="card-kicker">
              {categoryLabels[popup.category]} · {regionLabels[popup.region]}
            </div>
            <ShareLinkButton
              className="detail-share-button"
              feedbackClassName="detail-share-feedback"
              feedbackMode="inline"
              shareText={`${popup.title} 팝업 링크`}
              title={popup.title}
              url={`/popups/${popup.id}`}
            />
          </div>
          <h1>{popup.title}</h1>
          <div className="detail-meta-list" aria-label="팝업 상세 정보">
            <div className="detail-meta-item">
              <CalendarDays size={16} />
              <div>
                <span>운영 기간</span>
                <strong>
                  {popup.startDate} - {popup.endDate}
                </strong>
              </div>
            </div>
            <div className="detail-meta-item">
              <Clock size={16} />
              <div>
                <span>운영 시간</span>
                <strong>{popup.openingHours}</strong>
              </div>
            </div>
            <div className="detail-meta-item">
              <Ticket size={16} />
              <div>
                <span>입장</span>
                <strong>{popup.freeAdmission ? "무료" : `${popup.entryFee?.toLocaleString()}원`}</strong>
              </div>
            </div>
            <div className="detail-meta-item">
              <MapPin size={16} />
              <div>
                <span>주소</span>
                <strong>{popup.address}</strong>
                {popup.detailAddress ? <small>{popup.detailAddress}</small> : null}
              </div>
            </div>
          </div>
          <p>{popup.description}</p>
          <div className="detail-action-row">
            {popup.reservationUrl ? (
              <a className="primary-action" href={popup.reservationUrl} target="_blank" rel="noreferrer">
                <Ticket size={16} />
                예약하기
                <ExternalLink size={15} />
              </a>
            ) : null}
            {popup.officialUrl ? (
              <a className="secondary-action" href={popup.officialUrl} target="_blank" rel="noreferrer">
                공식 페이지
                <ExternalLink size={15} />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
