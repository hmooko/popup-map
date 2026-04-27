"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareLinkButtonProps {
  className?: string;
  feedbackClassName?: string;
  feedbackMode?: "inline" | "block";
  label?: string;
  shareText: string;
  title: string;
  url: string;
}

export function ShareLinkButton({
  className,
  feedbackClassName,
  feedbackMode = "block",
  label = "공유",
  shareText,
  title,
  url
}: ShareLinkButtonProps) {
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function handleShare() {
    const shareUrl = new URL(url, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl
        });
        setShareMessage("링크를 공유했습니다.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("링크를 복사했습니다.");
      }
    } catch {
      setShareMessage("공유를 완료하지 못했습니다.");
      return;
    }

    window.setTimeout(() => setShareMessage(null), 2200);
  }

  return (
    <div className={feedbackMode === "inline" ? "share-button-inline" : "share-button-block"}>
      <button className={className} type="button" onClick={handleShare} aria-label="링크 공유">
        <Share2 size={14} />
        <span>{label}</span>
      </button>
      {shareMessage ? <div className={feedbackClassName}>{shareMessage}</div> : null}
    </div>
  );
}
