package com.example.popupmapapi.popup.web;

import com.example.popupmapapi.popup.application.PopupService;
import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.PopupStatus;
import com.example.popupmapapi.popup.domain.Region;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/popups")
public class PopupController {

    private final PopupService popupService;

    @GetMapping
    public PageResponse<PopupListItemResponse> searchPopups(
            @RequestParam(required = false) Region region,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) PopupStatus status,
            @RequestParam(required = false) Boolean reservationRequired,
            @RequestParam(defaultValue = "false") boolean freeOnly,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return popupService.searchPopups(
                region,
                category,
                status,
                reservationRequired,
                freeOnly,
                startDate,
                endDate,
                page,
                size
        );
    }

    @GetMapping("/{popupId}")
    public PopupDetailResponse getPopup(@PathVariable Long popupId) {
        return popupService.getPopup(popupId);
    }

    @GetMapping("/map")
    public List<PopupMapItemResponse> getMapPopups(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal southWestLat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal southWestLng,
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal northEastLat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal northEastLng
    ) {
        return popupService.getMapPopups(southWestLat, southWestLng, northEastLat, northEastLng);
    }

    @GetMapping("/nearby")
    public List<NearbyPopupResponse> getNearbyPopups(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal lat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal lng,
            @RequestParam(defaultValue = "3000") @Min(100) @Max(10000) int radiusMeter
    ) {
        return popupService.getNearbyPopups(lat, lng, radiusMeter);
    }
}
