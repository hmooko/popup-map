package com.example.popupmapapi.admin.web.dto;

import com.example.popupmapapi.popup.domain.PopupClassification;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import java.time.LocalDateTime;

public record PopupClassificationResponse(
        Long id,
        PopupClassificationType type,
        String code,
        String label,
        int sortOrder,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PopupClassificationResponse from(PopupClassification classification) {
        return new PopupClassificationResponse(
                classification.getId(),
                classification.getType(),
                classification.getCode(),
                classification.getLabel(),
                classification.getSortOrder(),
                classification.isActive(),
                classification.getCreatedAt(),
                classification.getUpdatedAt()
        );
    }
}
