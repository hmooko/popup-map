"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { Category, Region } from "@/types/popup";

interface PopupFormState {
  title: string;
  brandName: string;
  description: string;
  category: Category;
  region: Region;
  address: string;
  detailAddress: string;
  startDate: string;
  endDate: string;
  openingHours: string;
  reservationRequired: boolean;
  freeAdmission: boolean;
  entryFee: string;
  officialUrl: string;
  reservationUrl: string;
  thumbnailUrl: string;
  visible: boolean;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

interface AdminPopup {
  id: number;
  title: string;
  brandName: string;
  description: string | null;
  category: Category;
  region: Region;
  address: string;
  detailAddress: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  openingHours: string;
  reservationRequired: boolean;
  freeAdmission: boolean;
  entryFee: number | null;
  officialUrl: string | null;
  reservationUrl: string | null;
  thumbnailUrl: string | null;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

const initialForm: PopupFormState = {
  title: "Ader Archive Popup",
  brandName: "Ader",
  description: "아카이브 제품과 한정 굿즈를 경험할 수 있는 성수 브랜드 팝업입니다.",
  category: "FASHION",
  region: "SEONGSU",
  address: "서울 성동구 연무장길 00",
  detailAddress: "1층 팝업존",
  startDate: "2026-04-20",
  endDate: "2026-05-12",
  openingHours: "11:00-20:00",
  reservationRequired: false,
  freeAdmission: true,
  entryFee: "",
  officialUrl: "https://example.com",
  reservationUrl: "",
  thumbnailUrl: "",
  visible: true
};

const regions = Object.keys(regionLabels) as Region[];
const categories = Object.keys(categoryLabels) as Category[];

function mapPopupToFormState(popup: AdminPopup): PopupFormState {
  return {
    title: popup.title,
    brandName: popup.brandName,
    description: popup.description ?? "",
    category: popup.category,
    region: popup.region,
    address: popup.address,
    detailAddress: popup.detailAddress ?? "",
    startDate: popup.startDate,
    endDate: popup.endDate,
    openingHours: popup.openingHours,
    reservationRequired: popup.reservationRequired,
    freeAdmission: popup.freeAdmission,
    entryFee: popup.entryFee === null ? "" : String(popup.entryFee),
    officialUrl: popup.officialUrl ?? "",
    reservationUrl: popup.reservationUrl ?? "",
    thumbnailUrl: popup.thumbnailUrl ?? "",
    visible: popup.visible
  };
}

function extractMessage(responseText: string, fallback: string) {
  if (!responseText) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(responseText) as { message?: string };
    return parsed.message ?? fallback;
  } catch {
    return responseText;
  }
}

export default function AdminPopupNewPage() {
  const [form, setForm] = useState<PopupFormState>(initialForm);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "manage">("editor");
  const [editingPopupId, setEditingPopupId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [authStatus, setAuthStatus] = useState<"idle" | "loggingIn" | "success" | "error">(
    "idle"
  );
  const [authMessage, setAuthMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const [adminPopups, setAdminPopups] = useState<AdminPopup[]>([]);
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "error">("idle");
  const [listMessage, setListMessage] = useState("");
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);
  const [togglingPopupId, setTogglingPopupId] = useState<number | null>(null);

  const isEditing = editingPopupId !== null;
  const selectedPopup = useMemo(
    () => adminPopups.find((popup) => popup.id === editingPopupId) ?? null,
    [adminPopups, editingPopupId]
  );
  const previewMeta = useMemo(() => {
    const start = form.startDate.slice(5).replace("-", ".");
    const end = form.endDate.slice(5).replace("-", ".");

    return `${regionLabels[form.region]} · ${categoryLabels[form.category]} · ${start} - ${end}`;
  }, [form.category, form.endDate, form.region, form.startDate]);

  function update<K extends keyof PopupFormState>(key: K, value: PopupFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetEditor() {
    setEditingPopupId(null);
    setForm(initialForm);
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function loadAdminPopups(keyword?: string) {
    if (!accessToken) {
      setAdminPopups([]);
      return;
    }

    setListStatus("loading");
    setListMessage("");

    const query = new URLSearchParams();
    const normalizedKeyword = (keyword ?? searchQuery).trim();

    if (normalizedKeyword) {
      query.set("q", normalizedKeyword);
    }

    try {
      const response = await fetch(
        query.toString() ? `/api/admin/popups?${query.toString()}` : "/api/admin/popups",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          cache: "no-store"
        }
      );
      const responseText = await response.text();

      if (!response.ok) {
        setListStatus("error");
        setListMessage(extractMessage(responseText, `목록 조회 실패: ${response.status}`));
        return;
      }

      const data = JSON.parse(responseText) as AdminPopup[];
      setAdminPopups(data);
      setListStatus("idle");
      setListMessage(data.length === 0 ? "조건에 맞는 팝업이 없습니다." : "");
    } catch (error) {
      setListStatus("error");
      setListMessage(error instanceof Error ? error.message : "목록 조회 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    if (!accessToken) {
      setAdminPopups([]);
      setEditingPopupId(null);
      return;
    }

    void loadAdminPopups("");
  }, [accessToken]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus("loggingIn");
    setAuthMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const responseText = await response.text();

      if (!response.ok) {
        setAccessToken("");
        setAuthStatus("error");
        setAuthMessage(extractMessage(responseText, `로그인 실패: ${response.status}`));
        return;
      }

      const data = JSON.parse(responseText) as LoginResponse;
      setAccessToken(data.accessToken);
      setAuthStatus("success");
      setAuthMessage(`${data.tokenType} 토큰 발급 완료, ${data.expiresIn}초 동안 유효합니다.`);
      setActiveTab("manage");
    } catch (error) {
      setAccessToken("");
      setAuthStatus("error");
      setAuthMessage(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.");
    }
  }

  function buildPayload() {
    return {
      title: form.title.trim(),
      brandName: form.brandName.trim(),
      description: form.description.trim() || null,
      category: form.category,
      region: form.region,
      address: form.address.trim(),
      detailAddress: form.detailAddress.trim() || null,
      startDate: form.startDate,
      endDate: form.endDate,
      openingHours: form.openingHours.trim(),
      reservationRequired: form.reservationRequired,
      freeAdmission: form.freeAdmission,
      entryFee: form.freeAdmission ? null : Number(form.entryFee || 0),
      officialUrl: form.officialUrl.trim() || null,
      reservationUrl: form.reservationUrl.trim() || null,
      thumbnailUrl: form.thumbnailUrl.trim() || null,
      visible: form.visible
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setSubmitStatus("error");
      setSubmitMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    setSubmitStatus("saving");
    setSubmitMessage("");

    const payload = buildPayload();
    const url = isEditing ? `/api/admin/popups/${editingPopupId}` : "/api/admin/popups";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        setSubmitStatus("error");
        setSubmitMessage(extractMessage(responseText, `${isEditing ? "수정" : "저장"} 실패: ${response.status}`));
        return;
      }

      const savedPopup = JSON.parse(responseText) as AdminPopup;
      setEditingPopupId(savedPopup.id);
      setForm(mapPopupToFormState(savedPopup));
      setSubmitStatus("success");
      setSubmitMessage(
        isEditing
          ? `${savedPopup.title} 팝업을 수정했습니다.`
          : `${savedPopup.title} 팝업을 등록했습니다.`
      );
      setActiveTab("manage");
      await loadAdminPopups(searchQuery);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    }
  }

  function handleStartEdit(popup: AdminPopup) {
    setEditingPopupId(popup.id);
    setForm(mapPopupToFormState(popup));
    setSubmitStatus("idle");
    setSubmitMessage("");
    setActiveTab("editor");
  }

  async function handleDelete(popup: AdminPopup) {
    if (!accessToken) {
      setListStatus("error");
      setListMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    if (!window.confirm(`${popup.title} 팝업을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingPopupId(popup.id);
    setListMessage("");

    try {
      const response = await fetch(`/api/admin/popups/${popup.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        setListStatus("error");
        setDeletingPopupId(null);
        setListMessage(extractMessage(responseText, `삭제 실패: ${response.status}`));
        return;
      }

      setDeletingPopupId(null);
      setAdminPopups((current) => current.filter((item) => item.id !== popup.id));
      setListStatus("idle");
      setListMessage(`${popup.title} 팝업을 삭제했습니다.`);

      if (editingPopupId === popup.id) {
        resetEditor();
      }
    } catch (error) {
      setListStatus("error");
      setDeletingPopupId(null);
      setListMessage(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleToggleVisibility(popup: AdminPopup) {
    if (!accessToken) {
      setListStatus("error");
      setListMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    setTogglingPopupId(popup.id);
    setListMessage("");

    try {
      const response = await fetch(`/api/admin/popups/${popup.id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ visible: !popup.visible })
      });

      const responseText = await response.text();

      if (!response.ok) {
        setListStatus("error");
        setTogglingPopupId(null);
        setListMessage(extractMessage(responseText, `공개 상태 변경 실패: ${response.status}`));
        return;
      }

      const { visible } = JSON.parse(responseText) as { visible: boolean };

      setAdminPopups((current) =>
        current.map((item) => (item.id === popup.id ? { ...item, visible } : item))
      );

      if (editingPopupId === popup.id) {
        setForm((current) => ({ ...current, visible }));
      }

      setTogglingPopupId(null);
      setListStatus("idle");
      setListMessage(`${popup.title} 팝업을 ${visible ? "공개" : "비공개"} 상태로 변경했습니다.`);
    } catch (error) {
      setListStatus("error");
      setTogglingPopupId(null);
      setListMessage(
        error instanceof Error ? error.message : "공개 상태 변경 중 오류가 발생했습니다."
      );
    }
  }

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadAdminPopups(searchQuery);
  }

  return (
    <main className="admin-shell">
      <header className="top-header admin-header">
        <a className="back-link" href="/">
          <ArrowLeft size={17} />
          사용자 화면
        </a>
        <h1>팝업 관리 콘솔</h1>
        <span className="api-badge">Spring Boot API</span>
      </header>

      <section className="form-panel admin-login-panel">
        <div className="section-heading">
          <div>
            <h2>관리자 로그인</h2>
            <p>명세의 관리자 로그인 API로 토큰을 발급받고 관리 콘솔을 활성화합니다.</p>
          </div>
          <span className={accessToken ? "login-state success" : "login-state"}>
            {accessToken ? "로그인됨" : "로그인 필요"}
          </span>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label>
            이메일
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            비밀번호
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="관리자 비밀번호"
            />
          </label>
          <button className="login-button" disabled={authStatus === "loggingIn"} type="submit">
            <LogIn size={17} />
            {authStatus === "loggingIn" ? "로그인 중" : "로그인"}
          </button>
        </form>

        {authMessage ? (
          <output className={authStatus === "success" ? "form-message success" : "form-message"}>
            {authMessage}
          </output>
        ) : null}
      </section>

      {!accessToken ? (
        <section className="form-panel admin-locked-panel">
          <h2>관리자 인증이 필요합니다.</h2>
          <p>
            이 화면은 직접 URL로 접근하더라도 로그인 전에는 관리 기능을 노출하지 않습니다.
            실제 보호는 관리자 JWT 인증으로 처리됩니다.
          </p>
        </section>
      ) : (
        <>
          <div className="admin-tabs" role="tablist" aria-label="관리자 작업">
            <button
              className={activeTab === "editor" ? "admin-tab active" : "admin-tab"}
              type="button"
              role="tab"
              aria-selected={activeTab === "editor"}
              onClick={() => setActiveTab("editor")}
            >
              편집기
            </button>
            <button
              className={activeTab === "manage" ? "admin-tab active" : "admin-tab"}
              type="button"
              role="tab"
              aria-selected={activeTab === "manage"}
              onClick={() => setActiveTab("manage")}
            >
              목록 관리
            </button>
          </div>

          {activeTab === "editor" ? (
        <div className="admin-grid">
          <section className="form-panel">
            <div className="section-heading">
              <div>
                <h2>{isEditing ? "팝업 수정" : "새 팝업 등록"}</h2>
                <p>주소를 기준으로 좌표는 서버에서 자동 계산해 저장됩니다.</p>
              </div>
              {isEditing ? <span className="editor-badge">수정 중 #{editingPopupId}</span> : null}
            </div>

            <div className="editor-actions">
              <button className="secondary-action" type="button" onClick={resetEditor}>
                <Plus size={16} />
                새 등록 모드
              </button>
              {selectedPopup ? (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => handleStartEdit(selectedPopup)}
                >
                  <RotateCcw size={16} />
                  불러온 값으로 되돌리기
                </button>
              ) : null}
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                팝업명
                <input
                  required
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                />
              </label>

              <label>
                브랜드명
                <input
                  required
                  value={form.brandName}
                  onChange={(event) => update("brandName", event.target.value)}
                />
              </label>

              <label>
                주소
                <input
                  required
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                />
              </label>

              <label>
                상세 주소
                <input
                  value={form.detailAddress}
                  onChange={(event) => update("detailAddress", event.target.value)}
                  placeholder="층, 호수, 매장 위치 등"
                />
              </label>

              <label>
                운영 시간
                <input
                  required
                  value={form.openingHours}
                  onChange={(event) => update("openingHours", event.target.value)}
                />
              </label>

              <div className="two-col">
                <label>
                  지역
                  <select
                    value={form.region}
                    onChange={(event) => update("region", event.target.value as Region)}
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {regionLabels[region]}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  카테고리
                  <select
                    value={form.category}
                    onChange={(event) => update("category", event.target.value as Category)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="two-col">
                <label>
                  시작일
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) => update("startDate", event.target.value)}
                  />
                </label>
                <label>
                  종료일
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={(event) => update("endDate", event.target.value)}
                  />
                </label>
              </div>

              <label>
                소개 문구
                <textarea
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                />
              </label>

              <div className="two-col">
                <label>
                  공식 링크
                  <input
                    value={form.officialUrl}
                    onChange={(event) => update("officialUrl", event.target.value)}
                    placeholder="https://example.com"
                  />
                </label>
                <label>
                  예약 링크
                  <input
                    value={form.reservationUrl}
                    onChange={(event) => update("reservationUrl", event.target.value)}
                    placeholder="https://example.com/reservation"
                  />
                </label>
              </div>

              <label>
                대표 이미지 URL
                <input
                  value={form.thumbnailUrl}
                  onChange={(event) => update("thumbnailUrl", event.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <label>
                입장료
                <input
                  disabled={form.freeAdmission}
                  inputMode="numeric"
                  value={form.entryFee}
                  onChange={(event) => update("entryFee", event.target.value)}
                  placeholder={form.freeAdmission ? "무료 입장 선택됨" : "0"}
                />
              </label>

              <div className="toggle-row">
                <button
                  className={form.freeAdmission ? "chip active" : "chip"}
                  type="button"
                  onClick={() => update("freeAdmission", !form.freeAdmission)}
                >
                  무료 입장
                </button>
                <button
                  className={form.reservationRequired ? "chip active" : "chip"}
                  type="button"
                  onClick={() => update("reservationRequired", !form.reservationRequired)}
                >
                  예약 필요
                </button>
                <button
                  className={form.visible ? "chip active" : "chip"}
                  type="button"
                  onClick={() => update("visible", !form.visible)}
                >
                  공개
                </button>
              </div>

              <button className="save-button" disabled={submitStatus === "saving"} type="submit">
                <Save size={17} />
                {submitStatus === "saving"
                  ? isEditing
                    ? "수정 중"
                    : "저장 중"
                  : isEditing
                    ? "수정 저장"
                    : "팝업 저장"}
              </button>

              {submitMessage ? (
                <output
                  className={submitStatus === "success" ? "form-message success" : "form-message"}
                >
                  {submitMessage}
                </output>
              ) : null}
            </form>
          </section>

          <aside className="preview-panel">
            <h2>편집 미리보기</h2>
            <div className="preview-image">
              {form.thumbnailUrl ? (
                <img
                  className="preview-image-tag"
                  src={form.thumbnailUrl}
                  alt={form.title ? `${form.title} 미리보기 이미지` : "팝업 미리보기 이미지"}
                />
              ) : null}
            </div>
            <strong>{form.title || "팝업명"}</strong>
            <span>{previewMeta}</span>
            <span>{form.detailAddress ? `${form.address} ${form.detailAddress}` : form.address}</span>
            <span>{form.visible ? "사용자에게 노출됨" : "비공개 상태"}</span>
            <p>{form.description || "등록한 정보가 사용자 카드에 어떻게 보이는지 확인합니다."}</p>
            {selectedPopup ? (
              <div className="editor-meta-card">
                <strong>현재 편집 중인 저장 데이터</strong>
                <span>최근 수정: {selectedPopup.updatedAt.replace("T", " ").slice(0, 16)}</span>
                <span>
                  좌표: {selectedPopup.latitude}, {selectedPopup.longitude}
                </span>
              </div>
            ) : null}
          </aside>
        </div>
      ) : (
        <section className="form-panel search-panel">
          <div className="section-heading">
            <div>
              <h2>전체 팝업 관리</h2>
              <p>검색 후 수정, 공개 전환, 삭제를 바로 처리할 수 있습니다.</p>
            </div>
            <span>{adminPopups.length}개</span>
          </div>

          <form className="search-actions" onSubmit={handleSearchSubmit}>
            <label>
              검색
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="팝업명, 브랜드, 주소"
              />
            </label>
            <button
              className="secondary-action"
              disabled={!accessToken || listStatus === "loading"}
              type="submit"
            >
              <RefreshCw size={16} />
              {listStatus === "loading" ? "불러오는 중" : "목록 새로고침"}
            </button>
          </form>

          {!accessToken ? (
            <div className="empty-state">로그인 후 전체 팝업 목록을 조회할 수 있습니다.</div>
          ) : adminPopups.length > 0 ? (
            <div className="manage-result-list">
              {adminPopups.map((popup) => (
                <article
                  className={
                    editingPopupId === popup.id
                      ? "manage-result-item selected"
                      : "manage-result-item"
                  }
                  key={popup.id}
                >
                  <div className="manage-result-main">
                    <small>
                      #{popup.id} · {categoryLabels[popup.category]} · {regionLabels[popup.region]}
                    </small>
                    <strong>{popup.title}</strong>
                    <span>{popup.address}</span>
                    <div className="manage-tags">
                      <span className={popup.visible ? "status-tag visible" : "status-tag hidden"}>
                        {popup.visible ? "공개" : "비공개"}
                      </span>
                      <span className="status-tag neutral">
                        {popup.freeAdmission
                          ? "무료"
                          : `${popup.entryFee?.toLocaleString() ?? 0}원`}
                      </span>
                      <span className="status-tag neutral">
                        {popup.reservationRequired ? "예약 필요" : "예약 없음"}
                      </span>
                    </div>
                  </div>

                  <div className="manage-result-actions">
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() => handleStartEdit(popup)}
                    >
                      <Pencil size={16} />
                      수정
                    </button>
                    <button
                      className="secondary-action"
                      disabled={togglingPopupId === popup.id}
                      type="button"
                      onClick={() => void handleToggleVisibility(popup)}
                    >
                      {popup.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                      {togglingPopupId === popup.id
                        ? "변경 중"
                        : popup.visible
                          ? "비공개"
                          : "공개"}
                    </button>
                    <button
                      className="delete-button"
                      disabled={deletingPopupId === popup.id}
                      type="button"
                      onClick={() => void handleDelete(popup)}
                    >
                      <Trash2 size={16} />
                      {deletingPopupId === popup.id ? "삭제 중" : "삭제"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {listStatus === "loading" ? "목록을 불러오는 중입니다." : "검색 결과가 없습니다."}
            </div>
          )}

          {listMessage ? (
            <output className={listStatus === "error" ? "form-message" : "form-message success"}>
              {listMessage}
            </output>
          ) : null}
        </section>
          )}
        </>
      )}
    </main>
  );
}
