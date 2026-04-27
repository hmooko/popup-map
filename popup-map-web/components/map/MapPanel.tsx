"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
const defaultCenter = { latitude: 37.5446, longitude: 127.0557 };

interface KakaoMapApi {
  maps: {
    LatLng: new (latitude: number, longitude: number) => unknown;
    Map: new (
      container: HTMLElement,
      options: { center: unknown; level: number }
    ) => KakaoMapInstance;
    CustomOverlay: new (options: {
      content: HTMLElement;
      position: unknown;
      yAnchor?: number;
    }) => KakaoOverlayInstance;
    event: {
      trigger: (target: KakaoMapInstance, eventName: string) => void;
    };
    load: (callback: () => void) => void;
  };
}

interface KakaoMapInstance {
  setCenter: (position: unknown) => void;
  setLevel: (level: number) => void;
  getLevel: () => number;
  relayout: () => void;
}

interface KakaoOverlayInstance {
  setMap: (map: KakaoMapInstance | null) => void;
}

declare global {
  interface Window {
    kakao?: KakaoMapApi;
  }
}

function loadKakaoMapSdk(appKey: string) {
  return new Promise<KakaoMapApi>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao as KakaoMapApi));
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-map-sdk]"
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.kakao?.maps.load(() => resolve(window.kakao as KakaoMapApi));
      });
      existingScript.addEventListener("error", () => reject(new Error("카카오맵 SDK 로딩 실패")));
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMapSdk = "true";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.addEventListener("load", () => {
      window.kakao?.maps.load(() => resolve(window.kakao as KakaoMapApi));
    });
    script.addEventListener("error", () => reject(new Error("카카오맵 SDK 로딩 실패")));
    document.head.appendChild(script);
  });
}

export function MapPanel({ popups, selectedPopup, onSelect }: MapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const overlaysRef = useRef<KakaoOverlayInstance[]>([]);
  const [openedPopupId, setOpenedPopupId] = useState<number | null>(null);
  const [sdkState, setSdkState] = useState<"idle" | "ready" | "fallback">(
    kakaoMapKey ? "idle" : "fallback"
  );

  const openedPopup = useMemo(
    () => popups.find((popup) => popup.id === openedPopupId) ?? null,
    [openedPopupId, popups]
  );

  useEffect(() => {
    if (openedPopupId && !popups.some((popup) => popup.id === openedPopupId)) {
      setOpenedPopupId(null);
    }
  }, [openedPopupId, popups]);

  useEffect(() => {
    setOpenedPopupId(selectedPopup?.id ?? null);
  }, [selectedPopup]);

  useEffect(() => {
    if (!kakaoMapKey || !mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    let active = true;

    loadKakaoMapSdk(kakaoMapKey)
      .then((kakao) => {
        if (!active || !mapContainerRef.current) {
          return;
        }

        const firstPopup = popups[0];
        const center = new kakao.maps.LatLng(
          firstPopup?.latitude ?? defaultCenter.latitude,
          firstPopup?.longitude ?? defaultCenter.longitude
        );

        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 4
        });
        setSdkState("ready");
      })
      .catch(() => setSdkState("fallback"));

    return () => {
      active = false;
    };
  }, [popups]);

  useEffect(() => {
    if (sdkState !== "ready" || !mapRef.current || !window.kakao?.maps) {
      return;
    }

    const kakao = window.kakao;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    popups.forEach((popup, index) => {
      const markerButton = document.createElement("button");
      markerButton.className =
        selectedPopup?.id === popup.id ? "map-marker kakao-marker selected" : "map-marker kakao-marker";
      markerButton.type = "button";
      markerButton.title = popup.title;
      markerButton.textContent = String(index + 1);
      markerButton.addEventListener("click", () => {
        onSelect(popup);
        setOpenedPopupId(popup.id);
        mapRef.current?.setCenter(new kakao.maps.LatLng(popup.latitude, popup.longitude));
      });

      const overlay = new kakao.maps.CustomOverlay({
        content: markerButton,
        position: new kakao.maps.LatLng(popup.latitude, popup.longitude),
        yAnchor: 1
      });

      overlay.setMap(mapRef.current);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
    };
  }, [onSelect, popups, sdkState, selectedPopup?.id]);

  function zoomIn() {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setLevel(Math.max(1, mapRef.current.getLevel() - 1));
  }

  function zoomOut() {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setLevel(mapRef.current.getLevel() + 1);
  }

  function moveToCurrentLocation() {
    if (!navigator.geolocation || !window.kakao?.maps || !mapRef.current) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.setCenter(
        new window.kakao!.maps.LatLng(position.coords.latitude, position.coords.longitude)
      );
    });
  }

  function relayoutMap() {
    mapRef.current?.relayout();
  }

  if (kakaoMapKey && sdkState !== "fallback") {
    return (
      <section className="map-panel real-map-panel" aria-label="팝업 지도">
        <div className="kakao-map-canvas" ref={mapContainerRef} />
        <div className="map-toolbar">
          <button type="button" title="현재 위치" onClick={moveToCurrentLocation}>
            <LocateFixed size={17} />
          </button>
          <button type="button" title="지도 새로고침" onClick={relayoutMap}>
            <RefreshCw size={17} />
          </button>
          <button type="button" title="확대" onClick={zoomIn}>
            <ZoomIn size={17} />
          </button>
          <button type="button" title="축소" onClick={zoomOut}>
            <ZoomOut size={17} />
          </button>
        </div>

        <div className="map-region-label">
          <Crosshair size={15} />
          카카오맵
        </div>

        {openedPopup ? (
          <div className="map-floating-card">
            <SelectedPopupPanel popup={openedPopup} />
          </div>
        ) : null}

        <div className="map-caption">
          {sdkState === "ready"
            ? openedPopup
              ? `${regionLabels[openedPopup.region]} · ${openedPopup.address}`
              : "마커를 선택하세요"
            : "카카오맵을 불러오는 중입니다"}
        </div>
      </section>
    );
  }

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
        {kakaoMapKey ? "지도 로딩 실패" : "카카오맵 키 필요"}
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
            onClick={() => {
              onSelect(popup);
              setOpenedPopupId(popup.id);
            }}
            title={popup.title}
          >
            {index + 1}
          </button>
        );
      })}

      {openedPopup ? (
        <div className="map-floating-card">
          <SelectedPopupPanel popup={openedPopup} />
        </div>
      ) : null}

      <div className="map-caption">
        {openedPopup ? `${regionLabels[openedPopup.region]} · ${openedPopup.address}` : "마커를 선택하세요"}
      </div>
    </section>
  );
}
