package com.example.popupmapapi.popup.web.dto;

import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.Region;
import java.math.BigDecimal;
import java.time.LocalDate;

public record NearbyPopupResponse(
        Long id,
        String title,
        String brandName,
        Category category,
        Region region,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalDate startDate,
        LocalDate endDate,
        boolean reservationRequired,
        boolean freeAdmission,
        String thumbnailUrl,
        int distanceMeter
) {
    public static NearbyPopupResponse from(Popup popup, BigDecimal lat, BigDecimal lng) {
        return new NearbyPopupResponse(
                popup.getId(),
                popup.getTitle(),
                popup.getBrandName(),
                popup.getCategory(),
                popup.getRegion(),
                popup.getAddress(),
                popup.getLatitude(),
                popup.getLongitude(),
                popup.getStartDate(),
                popup.getEndDate(),
                popup.isReservationRequired(),
                popup.isFreeAdmission(),
                popup.getThumbnailUrl(),
                distanceMeter(lat, lng, popup.getLatitude(), popup.getLongitude())
        );
    }

    private static int distanceMeter(BigDecimal fromLat, BigDecimal fromLng, BigDecimal toLat, BigDecimal toLng) {
        double earthRadius = 6_371_000.0;
        double lat1 = Math.toRadians(fromLat.doubleValue());
        double lat2 = Math.toRadians(toLat.doubleValue());
        double deltaLat = Math.toRadians(toLat.subtract(fromLat).doubleValue());
        double deltaLng = Math.toRadians(toLng.subtract(fromLng).doubleValue());
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (int) Math.round(earthRadius * c);
    }
}
