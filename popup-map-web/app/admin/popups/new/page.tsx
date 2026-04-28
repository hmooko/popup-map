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

interface PopupFormState {
  title: string;
  brandName: string;
  description: string;
  category: string;
  region: string;
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
  category: string;
  region: string;
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

interface PopupClassification {
  id: number;
  type: "REGION" | "CATEGORY";
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
}

interface ClassificationFormState {
  type: "REGION" | "CATEGORY";
  code: string;
  label: string;
  sortOrder: string;
}

interface BulkPopupPayload {
  title: string;
  brandName: string;
  description?: string | null;
  category: string;
  region: string;
  address: string;
  detailAddress?: string | null;
  startDate: string;
  endDate: string;
  openingHours: string;
  reservationRequired: boolean;
  freeAdmission: boolean;
  entryFee?: number | null;
  officialUrl?: string | null;
  reservationUrl?: string | null;
  thumbnailUrl?: string | null;
  visible?: boolean;
}

const initialForm: PopupFormState = {
  title: "Ader Archive Popup",
  brandName: "Ader",
  description: "아카이브 제품과 한정 굿즈를 경험할 수 있는 성수 브랜드 팝업입니다.",
  category: "",
  region: "",
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

const initialClassificationForm: ClassificationFormState = {
  type: "REGION",
  code: "",
  label: "",
  sortOrder: ""
};

const initialBulkJson = `[
  {
    "title": "Ader Archive Popup",
    "brandName": "Ader",
    "description": "아카이브 제품과 한정 굿즈를 경험할 수 있는 성수 브랜드 팝업입니다.",
    "category": "FASHION",
    "region": "SEONGSU",
    "address": "서울 성동구 연무장길 00",
    "detailAddress": "1층 팝업존",
    "startDate": "2026-04-20",
    "endDate": "2026-05-12",
    "openingHours": "11:00-20:00",
    "reservationRequired": false,
    "freeAdmission": true,
    "entryFee": null,
    "officialUrl": "https://example.com",
    "reservationUrl": null,
    "thumbnailUrl": null,
    "visible": true
  }
]`;

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

function toLabelMap(classifications: PopupClassification[]) {
  return classifications.reduce<Record<string, string>>((accumulator, classification) => {
    accumulator[classification.code] = classification.label;
    return accumulator;
  }, {});
}

function getClassificationLabel(labelMap: Record<string, string>, code: string) {
  return labelMap[code] ?? code;
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
  const [regions, setRegions] = useState<PopupClassification[]>([]);
  const [categories, setCategories] = useState<PopupClassification[]>([]);
  const [classificationForm, setClassificationForm] = useState<ClassificationFormState>(
    initialClassificationForm
  );
  const [adminRegions, setAdminRegions] = useState<PopupClassification[]>([]);
  const [adminCategories, setAdminCategories] = useState<PopupClassification[]>([]);
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "error">("idle");
  const [listMessage, setListMessage] = useState("");
  const [classificationStatus, setClassificationStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [classificationMessage, setClassificationMessage] = useState("");
  const [classificationManageStatus, setClassificationManageStatus] = useState<
    "idle" | "loading" | "saving" | "error"
  >("idle");
  const [classificationManageMessage, setClassificationManageMessage] = useState("");
  const [bulkJson, setBulkJson] = useState(initialBulkJson);
  const [bulkSubmitStatus, setBulkSubmitStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [bulkSubmitMessage, setBulkSubmitMessage] = useState("");
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);
  const [togglingPopupId, setTogglingPopupId] = useState<number | null>(null);
  const [deletingClassificationId, setDeletingClassificationId] = useState<number | null>(null);

  const regionLabels = useMemo(() => toLabelMap(regions), [regions]);
  const categoryLabels = useMemo(() => toLabelMap(categories), [categories]);
  const isEditing = editingPopupId !== null;
  const selectedPopup = useMemo(
    () => adminPopups.find((popup) => popup.id === editingPopupId) ?? null,
    [adminPopups, editingPopupId]
  );
  const previewMeta = useMemo(() => {
    const start = form.startDate.slice(5).replace("-", ".");
    const end = form.endDate.slice(5).replace("-", ".");

    return `${getClassificationLabel(regionLabels, form.region)} · ${getClassificationLabel(categoryLabels, form.category)} · ${start} - ${end}`;
  }, [categoryLabels, form.category, form.endDate, form.region, form.startDate, regionLabels]);

  function update<K extends keyof PopupFormState>(key: K, value: PopupFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateClassificationForm<K extends keyof ClassificationFormState>(
    key: K,
    value: ClassificationFormState[K]
  ) {
    setClassificationForm((current) => ({ ...current, [key]: value }));
  }

  function resetEditor() {
    setEditingPopupId(null);
    setForm((current) => ({
      ...initialForm,
      region: regions[0]?.code ?? "",
      category: categories[0]?.code ?? ""
    }));
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function loadClassifications() {
    setClassificationStatus("loading");
    setClassificationMessage("");

    try {
      const [regionResponse, categoryResponse] = await Promise.all([
        fetch("/api/popup-classifications?type=REGION", { cache: "no-store" }),
        fetch("/api/popup-classifications?type=CATEGORY", { cache: "no-store" })
      ]);

      const [regionResponseText, categoryResponseText] = await Promise.all([
        regionResponse.text(),
        categoryResponse.text()
      ]);

      if (!regionResponse.ok) {
        setClassificationStatus("error");
        setClassificationMessage(
          extractMessage(regionResponseText, `지역 목록 조회 실패: ${regionResponse.status}`)
        );
        return;
      }

      if (!categoryResponse.ok) {
        setClassificationStatus("error");
        setClassificationMessage(
          extractMessage(categoryResponseText, `카테고리 목록 조회 실패: ${categoryResponse.status}`)
        );
        return;
      }

      const nextRegions = JSON.parse(regionResponseText) as PopupClassification[];
      const nextCategories = JSON.parse(categoryResponseText) as PopupClassification[];

      setRegions(nextRegions);
      setCategories(nextCategories);
      setClassificationStatus("idle");
      setForm((current) => ({
        ...current,
        region:
          current.region && nextRegions.some((classification) => classification.code === current.region)
            ? current.region
            : (nextRegions[0]?.code ?? ""),
        category:
          current.category &&
          nextCategories.some((classification) => classification.code === current.category)
            ? current.category
            : (nextCategories[0]?.code ?? "")
      }));
    } catch (error) {
      setClassificationStatus("error");
      setClassificationMessage(
        error instanceof Error ? error.message : "분류 목록 조회 중 오류가 발생했습니다."
      );
    }
  }

  async function loadAdminClassifications() {
    if (!accessToken) {
      setAdminRegions([]);
      setAdminCategories([]);
      return;
    }

    setClassificationManageStatus("loading");
    setClassificationManageMessage("");

    try {
      const [regionResponse, categoryResponse] = await Promise.all([
        fetch("/api/admin/popup-classifications?type=REGION", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store"
        }),
        fetch("/api/admin/popup-classifications?type=CATEGORY", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store"
        })
      ]);

      const [regionResponseText, categoryResponseText] = await Promise.all([
        regionResponse.text(),
        categoryResponse.text()
      ]);

      if (!regionResponse.ok) {
        setClassificationManageStatus("error");
        setClassificationManageMessage(
          extractMessage(regionResponseText, `지역 관리 목록 조회 실패: ${regionResponse.status}`)
        );
        return;
      }

      if (!categoryResponse.ok) {
        setClassificationManageStatus("error");
        setClassificationManageMessage(
          extractMessage(categoryResponseText, `카테고리 관리 목록 조회 실패: ${categoryResponse.status}`)
        );
        return;
      }

      setAdminRegions(JSON.parse(regionResponseText) as PopupClassification[]);
      setAdminCategories(JSON.parse(categoryResponseText) as PopupClassification[]);
      setClassificationManageStatus("idle");
    } catch (error) {
      setClassificationManageStatus("error");
      setClassificationManageMessage(
        error instanceof Error ? error.message : "분류 관리 목록 조회 중 오류가 발생했습니다."
      );
    }
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
    void loadClassifications();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setAdminPopups([]);
      setEditingPopupId(null);
      setAdminRegions([]);
      setAdminCategories([]);
      return;
    }

    void loadAdminPopups("");
    void loadAdminClassifications();
  }, [accessToken]);

  async function handleClassificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setClassificationManageStatus("error");
      setClassificationManageMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    setClassificationManageStatus("saving");
    setClassificationManageMessage("");

    try {
      const response = await fetch("/api/admin/popup-classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          type: classificationForm.type,
          code: classificationForm.code.trim().toUpperCase(),
          label: classificationForm.label.trim(),
          sortOrder: classificationForm.sortOrder ? Number(classificationForm.sortOrder) : null,
          active: true
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        setClassificationManageStatus("error");
        setClassificationManageMessage(
          extractMessage(responseText, `분류 추가 실패: ${response.status}`)
        );
        return;
      }

      setClassificationForm((current) => ({ ...initialClassificationForm, type: current.type }));
      setClassificationManageStatus("idle");
      setClassificationManageMessage("분류 코드를 추가했습니다.");
      await Promise.all([loadClassifications(), loadAdminClassifications()]);
    } catch (error) {
      setClassificationManageStatus("error");
      setClassificationManageMessage(
        error instanceof Error ? error.message : "분류 추가 중 오류가 발생했습니다."
      );
    }
  }

  async function handleDeleteClassification(classification: PopupClassification) {
    if (!accessToken) {
      setClassificationManageStatus("error");
      setClassificationManageMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    if (!window.confirm(`${classification.label} (${classification.code}) 코드를 삭제할까요?`)) {
      return;
    }

    setDeletingClassificationId(classification.id);
    setClassificationManageMessage("");

    try {
      const response = await fetch(`/api/admin/popup-classifications/${classification.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        setDeletingClassificationId(null);
        setClassificationManageStatus("error");
        setClassificationManageMessage(
          extractMessage(responseText, `분류 삭제 실패: ${response.status}`)
        );
        return;
      }

      setDeletingClassificationId(null);
      setClassificationManageStatus("idle");
      setClassificationManageMessage("분류 코드를 삭제했습니다.");
      await Promise.all([loadClassifications(), loadAdminClassifications()]);
    } catch (error) {
      setDeletingClassificationId(null);
      setClassificationManageStatus("error");
      setClassificationManageMessage(
        error instanceof Error ? error.message : "분류 삭제 중 오류가 발생했습니다."
      );
    }
  }

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

  async function handleBulkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setBulkSubmitStatus("error");
      setBulkSubmitMessage("먼저 관리자 로그인을 완료해 주세요.");
      return;
    }

    let payload: BulkPopupPayload[];

    try {
      const parsed = JSON.parse(bulkJson) as unknown;

      if (!Array.isArray(parsed)) {
        setBulkSubmitStatus("error");
        setBulkSubmitMessage("JSON 배열 형태로 입력해 주세요.");
        return;
      }

      if (parsed.length === 0) {
        setBulkSubmitStatus("error");
        setBulkSubmitMessage("최소 1개 이상의 팝업 객체가 필요합니다.");
        return;
      }

      payload = parsed as BulkPopupPayload[];
    } catch {
      setBulkSubmitStatus("error");
      setBulkSubmitMessage("JSON 문법이 올바르지 않습니다.");
      return;
    }

    setBulkSubmitStatus("saving");
    setBulkSubmitMessage("");

    try {
      const response = await fetch("/api/admin/popups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        setBulkSubmitStatus("error");
        setBulkSubmitMessage(extractMessage(responseText, `일괄 등록 실패: ${response.status}`));
        return;
      }

      const savedPopups = JSON.parse(responseText) as AdminPopup[];
      setBulkSubmitStatus("success");
      setBulkSubmitMessage(`${savedPopups.length}개의 팝업을 일괄 등록했습니다.`);
      setActiveTab("manage");
      await loadAdminPopups(searchQuery);
    } catch (error) {
      setBulkSubmitStatus("error");
      setBulkSubmitMessage(error instanceof Error ? error.message : "일괄 등록 중 오류가 발생했습니다.");
    }
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
                    onChange={(event) => update("region", event.target.value)}
                    disabled={classificationStatus === "loading" || regions.length === 0}
                  >
                    {regions.map((region) => (
                      <option key={region.id} value={region.code}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  카테고리
                  <select
                    value={form.category}
                    onChange={(event) => update("category", event.target.value)}
                    disabled={classificationStatus === "loading" || categories.length === 0}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.code}>
                        {category.label}
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

              {classificationMessage ? (
                <output
                  className={
                    classificationStatus === "error" ? "form-message" : "form-message success"
                  }
                >
                  {classificationMessage}
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
        <>
        <section className="form-panel bulk-panel">
          <div className="section-heading">
            <div>
              <h2>JSON 일괄 등록</h2>
              <p>JSON 배열을 붙여넣어 여러 팝업을 한 번에 등록합니다.</p>
            </div>
          </div>

          <form className="bulk-form" onSubmit={handleBulkSubmit}>
            <label>
              팝업 JSON 배열
              <textarea
                className="bulk-json-input"
                value={bulkJson}
                onChange={(event) => setBulkJson(event.target.value)}
                spellCheck={false}
              />
            </label>
            <button className="save-button" disabled={bulkSubmitStatus === "saving"} type="submit">
              <Save size={17} />
              {bulkSubmitStatus === "saving" ? "일괄 등록 중" : "JSON 일괄 등록"}
            </button>
            {bulkSubmitMessage ? (
              <output
                className={bulkSubmitStatus === "success" ? "form-message success" : "form-message"}
              >
                {bulkSubmitMessage}
              </output>
            ) : null}
          </form>
        </section>

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
                      #{popup.id} · {getClassificationLabel(categoryLabels, popup.category)} ·{" "}
                      {getClassificationLabel(regionLabels, popup.region)}
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

        <section className="form-panel classification-panel">
          <div className="section-heading">
            <div>
              <h2>지역 / 카테고리 관리</h2>
              <p>새 분류 코드를 추가하거나 사용되지 않는 코드를 삭제할 수 있습니다.</p>
            </div>
          </div>

          <form className="classification-form" onSubmit={handleClassificationSubmit}>
            <label>
              분류 타입
              <select
                value={classificationForm.type}
                onChange={(event) =>
                  updateClassificationForm("type", event.target.value as ClassificationFormState["type"])
                }
              >
                <option value="REGION">지역</option>
                <option value="CATEGORY">카테고리</option>
              </select>
            </label>
            <label>
              코드
              <input
                required
                value={classificationForm.code}
                onChange={(event) => updateClassificationForm("code", event.target.value.toUpperCase())}
                placeholder="SEONGSU_SIDE"
              />
            </label>
            <label>
              라벨
              <input
                required
                value={classificationForm.label}
                onChange={(event) => updateClassificationForm("label", event.target.value)}
                placeholder="성수 사이드"
              />
            </label>
            <label>
              정렬 순서
              <input
                inputMode="numeric"
                value={classificationForm.sortOrder}
                onChange={(event) => updateClassificationForm("sortOrder", event.target.value)}
                placeholder="70"
              />
            </label>
            <button
              className="save-button"
              disabled={classificationManageStatus === "saving"}
              type="submit"
            >
              <Plus size={17} />
              {classificationManageStatus === "saving" ? "추가 중" : "분류 추가"}
            </button>
          </form>

          <div className="classification-grid">
            <div className="classification-column">
              <div className="classification-column-header">
                <h3>지역</h3>
                <button
                  className="secondary-action"
                  disabled={classificationManageStatus === "loading"}
                  type="button"
                  onClick={() => void loadAdminClassifications()}
                >
                  <RefreshCw size={16} />
                  새로고침
                </button>
              </div>
              <div className="delete-result-list">
                {adminRegions.map((classification) => (
                  <article className="delete-result-item" key={classification.id}>
                    <div>
                      <small>{classification.code}</small>
                      <strong>{classification.label}</strong>
                      <span>정렬 순서 {classification.sortOrder}</span>
                    </div>
                    <button
                      className="delete-button"
                      disabled={deletingClassificationId === classification.id}
                      type="button"
                      onClick={() => void handleDeleteClassification(classification)}
                    >
                      <Trash2 size={16} />
                      {deletingClassificationId === classification.id ? "삭제 중" : "삭제"}
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="classification-column">
              <div className="classification-column-header">
                <h3>카테고리</h3>
              </div>
              <div className="delete-result-list">
                {adminCategories.map((classification) => (
                  <article className="delete-result-item" key={classification.id}>
                    <div>
                      <small>{classification.code}</small>
                      <strong>{classification.label}</strong>
                      <span>정렬 순서 {classification.sortOrder}</span>
                    </div>
                    <button
                      className="delete-button"
                      disabled={deletingClassificationId === classification.id}
                      type="button"
                      onClick={() => void handleDeleteClassification(classification)}
                    >
                      <Trash2 size={16} />
                      {deletingClassificationId === classification.id ? "삭제 중" : "삭제"}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {classificationManageMessage ? (
            <output
              className={
                classificationManageStatus === "error" ? "form-message" : "form-message success"
              }
            >
              {classificationManageMessage}
            </output>
          ) : null}
        </section>
        </>
          )}
        </>
      )}
    </main>
  );
}
