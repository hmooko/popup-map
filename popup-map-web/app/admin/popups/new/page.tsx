"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, LogIn, RefreshCw, Save, Trash2 } from "lucide-react";
import { categoryLabels, regionLabels } from "@/lib/labels";
import { mapPopupApiItem, type PopupApiItem } from "@/lib/popupMapper";
import type { Category, Popup, Region } from "@/types/popup";

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

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

const regions = Object.keys(regionLabels) as Region[];
const categories = Object.keys(categoryLabels) as Category[];

export default function AdminPopupNewPage() {
  const [form, setForm] = useState<PopupFormState>(initialForm);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "search">("create");
  const [authStatus, setAuthStatus] = useState<"idle" | "loggingIn" | "success" | "error">(
    "idle"
  );
  const [authMessage, setAuthMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [adminPopups, setAdminPopups] = useState<Popup[]>([]);
  const [deleteQuery, setDeleteQuery] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "deleting" | "success" | "error">(
    "idle"
  );
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);

  const filteredDeletePopups = useMemo(() => {
    const normalizedQuery = deleteQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return adminPopups;
    }

    return adminPopups.filter((popup) =>
      [popup.title, popup.brandName, popup.address, popup.detailAddress ?? "", String(popup.id)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [adminPopups, deleteQuery]);

  const previewMeta = useMemo(() => {
    const start = form.startDate.slice(5).replace("-", ".");
    const end = form.endDate.slice(5).replace("-", ".");

    return `${regionLabels[form.region]} · ${categoryLabels[form.category]} · ${start} - ${end}`;
  }, [form.category, form.endDate, form.region, form.startDate]);

  function update<K extends keyof PopupFormState>(key: K, value: PopupFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadAdminPopups() {
    setDeleteStatus("loading");
    setDeleteMessage("");

    try {
      const response = await fetch("/api/popups", {
        cache: "no-store"
      });
      const responseText = await response.text();

      if (!response.ok) {
        setDeleteStatus("error");
        setDeleteMessage(responseText || `목록 조회 실패: ${response.status}`);
        return;
      }

      const data = JSON.parse(responseText) as { content?: PopupApiItem[] };
      const mappedPopups = (data.content ?? []).map((popup, index) =>
        mapPopupApiItem(popup, index)
      );

      setAdminPopups(mappedPopups);
      setDeleteStatus("idle");
    } catch (error) {
      setDeleteStatus("error");
      setDeleteMessage(error instanceof Error ? error.message : "목록 조회 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    void loadAdminPopups();
  }, []);

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
        setAuthMessage(responseText || `로그인 실패: ${response.status}`);
        return;
      }

      const data = JSON.parse(responseText) as LoginResponse;

      setAccessToken(data.accessToken);
      setAuthStatus("success");
      setAuthMessage(`${data.tokenType} 토큰 발급 완료, ${data.expiresIn}초 동안 유효합니다.`);
    } catch (error) {
      setAccessToken("");
      setAuthStatus("error");
      setAuthMessage(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const payload = {
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

    try {
      const response = await fetch("/api/admin/popups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        setStatus("error");
        setMessage(responseText || `저장 실패: ${response.status}`);
        return;
      }

      setStatus("success");
      setMessage(responseText || "팝업을 저장했습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function handleDelete(popup: Popup) {
    if (!window.confirm(`${popup.title} 팝업을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeleteStatus("deleting");
    setDeletingPopupId(popup.id);
    setDeleteMessage("");

    try {
      const response = await fetch(`/api/admin/popups/${popup.id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        setDeleteStatus("error");
        setDeletingPopupId(null);
        setDeleteMessage(responseText || `삭제 실패: ${response.status}`);
        return;
      }

      setDeleteStatus("success");
      setDeletingPopupId(null);
      setAdminPopups((current) => current.filter((item) => item.id !== popup.id));
      setDeleteMessage(`${popup.title} 팝업을 삭제했습니다.`);
    } catch (error) {
      setDeleteStatus("error");
      setDeletingPopupId(null);
      setDeleteMessage(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <main className="admin-shell">
      <header className="top-header admin-header">
        <a className="back-link" href="/">
          <ArrowLeft size={17} />
          사용자 화면
        </a>
        <h1>팝업 등록 관리</h1>
        <span className="api-badge">Spring Boot API</span>
      </header>

      <section className="form-panel admin-login-panel">
        <div className="section-heading">
          <div>
            <h2>관리자 로그인</h2>
            <p>명세의 관리자 로그인 API로 토큰을 발급받습니다.</p>
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

      <div className="admin-tabs" role="tablist" aria-label="관리자 작업">
        <button
          className={activeTab === "create" ? "admin-tab active" : "admin-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "create"}
          onClick={() => setActiveTab("create")}
        >
          생성
        </button>
        <button
          className={activeTab === "search" ? "admin-tab active" : "admin-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "search"}
          onClick={() => setActiveTab("search")}
        >
          검색
        </button>
      </div>

      {activeTab === "create" ? (
      <div className="admin-grid">
        <section className="form-panel">
          <div className="section-heading">
            <div>
              <h2>기본 정보</h2>
              <p>주소를 기준으로 좌표는 서버에서 자동 계산해 저장됩니다.</p>
            </div>
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

            <button className="save-button" disabled={status === "saving"} type="submit">
              <Save size={17} />
              {status === "saving" ? "저장 중" : "팝업 저장"}
            </button>

            {message ? (
              <output className={status === "success" ? "form-message success" : "form-message"}>
                {message}
              </output>
            ) : null}
          </form>
        </section>

        <aside className="preview-panel">
          <h2>사용자 화면 미리보기</h2>
          <div className="preview-image" />
          <strong>{form.title || "팝업명"}</strong>
          <span>{previewMeta}</span>
          <span>{form.detailAddress ? `${form.address} ${form.detailAddress}` : form.address}</span>
          <p>{form.description || "등록한 정보가 사용자 카드에 어떻게 보이는지 확인합니다."}</p>
        </aside>
      </div>
      ) : (
        <section className="form-panel search-panel">
          <div className="section-heading">
            <div>
              <h2>팝업 검색</h2>
              <p>팝업명, 브랜드, 주소로 검색한 뒤 삭제합니다.</p>
            </div>
            <span>{filteredDeletePopups.length}개</span>
          </div>

          <div className="search-actions">
            <label>
              검색
              <input
                value={deleteQuery}
                onChange={(event) => setDeleteQuery(event.target.value)}
                placeholder="팝업명, 브랜드, 주소"
              />
            </label>
            <button
              className="secondary-action"
              disabled={deleteStatus === "loading"}
              type="button"
              onClick={loadAdminPopups}
            >
              <RefreshCw size={16} />
              {deleteStatus === "loading" ? "불러오는 중" : "목록 새로고침"}
            </button>
          </div>

          <div className="delete-result-list">
            {filteredDeletePopups.length > 0 ? (
              filteredDeletePopups.map((popup) => (
                <article className="delete-result-item" key={popup.id}>
                  <div>
                    <small>
                      #{popup.id} · {categoryLabels[popup.category]} · {regionLabels[popup.region]}
                    </small>
                    <strong>{popup.title}</strong>
                    <span>{popup.address}</span>
                  </div>
                  <button
                    className="delete-button"
                    disabled={deleteStatus === "deleting"}
                    type="button"
                    onClick={() => void handleDelete(popup)}
                  >
                    <Trash2 size={16} />
                    {deletingPopupId === popup.id ? "삭제 중" : "삭제"}
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state">검색 결과가 없습니다.</div>
            )}
          </div>

          {deleteMessage ? (
            <output className={deleteStatus === "success" ? "form-message success" : "form-message"}>
              {deleteMessage}
            </output>
          ) : null}
        </section>
      )}
    </main>
  );
}
