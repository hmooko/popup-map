package com.example.popupmapapi.popup.web.dto;

import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.Region;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PopupMapItemResponse(
        Long id,
        String title,
        String brandName,
        Category category,
        Region region,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalDate startDate,
        LocalDate endDate,
        boolean reservationRequired,
        boolean freeAdmission,
        String thumbnailUrl
) {
    public static PopupMapItemResponse from(Popup popup) {
        return new PopupMapItemResponse(
                popup.getId(),
                popup.getTitle(),
                popup.getBrandName(),
                popup.getCategory(),
                popup.getRegion(),
                popup.getLatitude(),
                popup.getLongitude(),
                popup.getStartDate(),
                popup.getEndDate(),
                popup.isReservationRequired(),
                popup.isFreeAdmission(),
                popup.getThumbnailUrl()
        );
    }
}
