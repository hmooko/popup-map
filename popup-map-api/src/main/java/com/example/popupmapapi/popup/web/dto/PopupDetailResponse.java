package com.example.popupmapapi.popup.web.dto;

import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.Region;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PopupDetailResponse(
        Long id,
        String title,
        String brandName,
        String description,
        Category category,
        Region region,
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
        String reservationUrl,
        String thumbnailUrl
) {
    public static PopupDetailResponse from(Popup popup) {
        return new PopupDetailResponse(
                popup.getId(),
                popup.getTitle(),
                popup.getBrandName(),
                popup.getDescription(),
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
                popup.getReservationUrl(),
                popup.getThumbnailUrl()
        );
    }
}
