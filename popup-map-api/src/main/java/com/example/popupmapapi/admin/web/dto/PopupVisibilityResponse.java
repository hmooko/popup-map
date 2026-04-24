package com.example.popupmapapi.admin.web.dto;

import com.example.popupmapapi.popup.domain.Popup;
import java.time.LocalDateTime;

public record PopupVisibilityResponse(
        Long id,
        boolean visible,
        LocalDateTime updatedAt
) {
    public static PopupVisibilityResponse from(Popup popup) {
        return new PopupVisibilityResponse(popup.getId(), popup.isVisible(), popup.getUpdatedAt());
    }
}
