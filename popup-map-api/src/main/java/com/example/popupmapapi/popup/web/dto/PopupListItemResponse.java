package com.example.popupmapapi.popup.web.dto;

import com.example.popupmapapi.popup.domain.Popup;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PopupListItemResponse(
        Long id,
        String title,
        String brandName,
        String category,
        String region,
        String address,
        String detailAddress,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalDate startDate,
        LocalDate endDate,
        String openingHours,
        boolean reservationRequired,
        boolean freeAdmission,
        Integer entryFee,
        String officialUrl,
        String thumbnailUrl
) {
    public static PopupListItemResponse from(Popup popup) {
        return new PopupListItemResponse(
                popup.getId(),
                popup.getTitle(),
                popup.getBrandName(),
                popup.getCategory(),
                popup.getRegion(),
                popup.getAddress(),
                popup.getDetailAddress(),
                popup.getLatitude(),
                popup.getLongitude(),
                popup.getStartDate(),
                popup.getEndDate(),
                popup.getOpeningHours(),
                popup.isReservationRequired(),
                popup.isFreeAdmission(),
                popup.getEntryFee(),
                popup.getOfficialUrl(),
                popup.getThumbnailUrl()
        );
    }
}
