import { ArrowLeft, Save } from "lucide-react";

const fields = [
  { label: "팝업명", value: "Ader Archive Popup" },
  { label: "브랜드명", value: "Ader" },
  { label: "주소", value: "서울 성동구 연무장길 00" },
  { label: "운영 시간", value: "11:00-20:00" }
];

export default function AdminPopupNewPage() {
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

      <div className="admin-grid">
        <section className="form-panel">
          <div className="section-heading">
            <div>
              <h2>기본 정보</h2>
              <p>API 명세에 맞춰 팝업 등록 필드를 구성합니다.</p>
            </div>
          </div>

          <div className="form-grid">
            {fields.map((field) => (
              <label key={field.label}>
                {field.label}
                <input defaultValue={field.value} />
              </label>
            ))}

            <label>
              지역
              <select defaultValue="SEONGSU">
                <option value="SEONGSU">성수</option>
                <option value="HONGDAE">홍대</option>
                <option value="GANGNAM">강남</option>
              </select>
            </label>

            <label>
              카테고리
              <select defaultValue="FASHION">
                <option value="FASHION">패션</option>
                <option value="BEAUTY">뷰티</option>
                <option value="CHARACTER">캐릭터</option>
              </select>
            </label>

            <div className="two-col">
              <label>
                시작일
                <input defaultValue="2026-04-20" />
              </label>
              <label>
                종료일
                <input defaultValue="2026-05-12" />
              </label>
            </div>

            <div className="two-col">
              <label>
                위도
                <input defaultValue="37.5446" />
              </label>
              <label>
                경도
                <input defaultValue="127.0557" />
              </label>
            </div>

            <label>
              소개 문구
              <textarea defaultValue="아카이브 제품과 한정 굿즈를 경험할 수 있는 성수 브랜드 팝업입니다." />
            </label>

            <div className="toggle-row">
              <button className="chip active" type="button">
                무료 입장
              </button>
              <button className="chip" type="button">
                예약 필요
              </button>
              <button className="chip active" type="button">
                공개
              </button>
            </div>

            <button className="save-button" type="button">
              <Save size={17} />
              팝업 저장
            </button>
          </div>
        </section>

        <aside className="preview-panel">
          <h2>사용자 화면 미리보기</h2>
          <div className="preview-image" />
          <strong>Ader Archive Popup</strong>
          <span>성수 · 패션 · 4.20 - 5.12</span>
          <p>등록한 정보가 사용자 카드에 어떻게 보이는지 확인합니다.</p>
        </aside>
      </div>
    </main>
  );
}
