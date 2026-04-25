"use client";

import { Crosshair, LocateFixed, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { regionLabels } from "@/lib/labels";
import type { Popup } from "@/types/popup";
import { SelectedPopupPanel } from "@/components/popup/SelectedPopupPanel";

interface MapPanelProps {
  popups: Popup[];
  selectedPopup: Popup | null;
  onSelect: (popup: Popup) => void;
}

const markerPositions = [
  { left: "42%", top: "32%" },
  { left: "62%", top: "48%" },
  { left: "30%", top: "58%" },
  { left: "54%", top: "66%" }
];

export function MapPanel({ popups, selectedPopup, onSelect }: MapPanelProps) {
  return (
    <section className="map-panel" aria-label="팝업 지도">
      <div className="map-toolbar">
        <button type="button" title="현재 위치">
          <LocateFixed size={17} />
        </button>
        <button type="button" title="지도 경계 새로고침">
          <RefreshCw size={17} />
        </button>
        <button type="button" title="확대">
          <ZoomIn size={17} />
        </button>
        <button type="button" title="축소">
          <ZoomOut size={17} />
        </button>
      </div>

      <div className="map-road horizontal" />
      <div className="map-road vertical" />
      <div className="map-region-label">
        <Crosshair size={15} />
        서울 주요 상권
      </div>

      {popups.map((popup, index) => {
        const position = markerPositions[index % markerPositions.length];
        const selected = selectedPopup?.id === popup.id;

        return (
          <button
            key={popup.id}
            className={selected ? "map-marker selected" : "map-marker"}
            style={position}
            type="button"
            onClick={() => onSelect(popup)}
            title={popup.title}
          >
            {index + 1}
          </button>
        );
      })}

      {selectedPopup ? (
        <div className="map-floating-card">
          <SelectedPopupPanel popup={selectedPopup} />
        </div>
      ) : null}

      <div className="map-caption">
        {selectedPopup ? `${regionLabels[selectedPopup.region]} · ${selectedPopup.address}` : "마커를 선택하세요"}
      </div>
    </section>
  );
}
