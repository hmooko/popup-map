package com.example.popupmapapi.popup.service;

import com.example.popupmapapi.admin.web.dto.AdminPopupResponse;
import com.example.popupmapapi.admin.web.dto.PopupCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupUpdateRequest;
import com.example.popupmapapi.admin.web.dto.PopupVisibilityResponse;
import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.common.error.ErrorCode;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import com.example.popupmapapi.popup.persistence.PopupRepository;
import com.example.popupmapapi.popup.web.dto.NearbyPopupResponse;
import com.example.popupmapapi.popup.web.dto.PageResponse;
import com.example.popupmapapi.popup.web.dto.PopupDetailResponse;
import com.example.popupmapapi.popup.web.dto.PopupListItemResponse;
import com.example.popupmapapi.popup.web.dto.PopupMapItemResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupService {

    private static final int MAX_MAP_POPUPS = 50;

    private final PopupRepository popupRepository;
    private final GeocodingService geocodingService;
    private final PopupClassificationService popupClassificationService;

    public PageResponse<PopupListItemResponse> searchPopups(
            String region,
            String category,
            Boolean reservationRequired,
            boolean freeOnly,
            LocalDate openOnDate,
            LocalDate startDateFrom,
            LocalDate dateFrom,
            LocalDate dateTo,
            int page,
            int size
    ) {
        validateDateRange(dateFrom, dateTo);
        String normalizedRegion = normalizeClassificationCode(region);
        String normalizedCategory = normalizeClassificationCode(category);
        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(popupRepository.searchPublicPopups(
                normalizedRegion,
                normalizedCategory,
                reservationRequired,
                freeOnly,
                openOnDate,
                startDateFrom,
                dateFrom,
                dateTo,
                today,
                pageable
        ).map(PopupListItemResponse::from));
    }

    public PopupDetailResponse getPopup(Long popupId) {
        LocalDate today = LocalDate.now();
        Popup popup = popupRepository.findByIdAndVisibleTrue(popupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "팝업을 찾을 수 없습니다."));
        if (popup.getEndDate().isBefore(today)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "팝업을 찾을 수 없습니다.");
        }
        return PopupDetailResponse.from(popup);
    }

    public List<PopupMapItemResponse> getMapPopups(
            BigDecimal southWestLat,
            BigDecimal southWestLng,
            BigDecimal northEastLat,
            BigDecimal northEastLng
    ) {
        if (southWestLat.compareTo(northEastLat) > 0 || southWestLng.compareTo(northEastLng) > 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "지도 경계 좌표가 올바르지 않습니다.");
        }
        return popupRepository.findVisibleInBounds(
                        southWestLat,
                        southWestLng,
                        northEastLat,
                        northEastLng,
                        LocalDate.now(),
                        PageRequest.of(0, MAX_MAP_POPUPS)
                ).stream()
                .map(PopupMapItemResponse::from)
                .toList();
    }

    public List<NearbyPopupResponse> getNearbyPopups(BigDecimal lat, BigDecimal lng, int radiusMeter) {
        return popupRepository.findVisibleNearby(lat, lng, radiusMeter, LocalDate.now()).stream()
                .map(popup -> NearbyPopupResponse.from(popup, lat, lng))
                .toList();
    }

    public List<AdminPopupResponse> getAdminPopups(String keyword) {
        String normalizedKeyword = blankToNull(keyword);
        List<Popup> popups = normalizedKeyword == null
                ? popupRepository.findAllAdminPopups()
                : popupRepository.searchAdminPopups(normalizedKeyword);

        return popups.stream()
                .map(AdminPopupResponse::from)
                .toList();
    }

    @Transactional
    public AdminPopupResponse createPopup(PopupCreateRequest request) {
        String category = normalizeRequiredClassificationCode(request.category(), "카테고리");
        String region = normalizeRequiredClassificationCode(request.region(), "지역");
        validateCreateRequest(region, category, request);
        GeocodingResult geocodingResult = geocodingService.geocodeAddress(request.address());
        Popup popup = popupRepository.save(Popup.builder()
                .title(request.title())
                .brandName(request.brandName())
                .description(request.description())
                .category(category)
                .region(region)
                .address(request.address())
                .detailAddress(blankToNull(request.detailAddress()))
                .latitude(geocodingResult.latitude())
                .longitude(geocodingResult.longitude())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .openingHours(request.openingHours())
                .reservationRequired(request.reservationRequired())
                .freeAdmission(request.freeAdmission())
                .entryFee(normalizeEntryFee(request.freeAdmission(), request.entryFee()))
                .officialUrl(request.officialUrl())
                .reservationUrl(request.reservationUrl())
                .thumbnailUrl(request.thumbnailUrl())
                .visible(request.visible() == null || request.visible())
                .build());
        return AdminPopupResponse.from(popup);
    }

    @Transactional
    public List<AdminPopupResponse> createPopups(List<PopupCreateRequest> requests) {
        if (requests.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "최소 1개 이상의 팝업 등록 요청이 필요합니다.");
        }

        return requests.stream()
                .map(this::createPopup)
                .toList();
    }

    @Transactional
    public AdminPopupResponse updatePopup(Long popupId, PopupUpdateRequest request) {
        Popup popup = getAdminPopupEntity(popupId);
        String nextCategory = normalizeClassificationCode(request.category());
        String nextRegion = normalizeClassificationCode(request.region());
        LocalDate nextStartDate = request.startDate() == null ? popup.getStartDate() : request.startDate();
        LocalDate nextEndDate = request.endDate() == null ? popup.getEndDate() : request.endDate();
        validateDateRange(nextStartDate, nextEndDate);
        validatePopupClassifications(
                nextRegion == null ? popup.getRegion() : nextRegion,
                nextCategory == null ? popup.getCategory() : nextCategory
        );
        Boolean nextFreeAdmission = request.freeAdmission();
        Integer nextEntryFee = request.entryFee();
        if (nextFreeAdmission == null) {
            nextFreeAdmission = popup.isFreeAdmission();
        }
        if (nextEntryFee == null && !Boolean.TRUE.equals(request.freeAdmission())) {
            nextEntryFee = popup.getEntryFee();
        }
        validateAdmission(nextFreeAdmission, nextEntryFee);
        String nextAddress = blankToNull(request.address());
        String nextDetailAddress = blankToNull(request.detailAddress());
        GeocodingResult geocodingResult = nextAddress == null
                ? null
                : geocodingService.geocodeAddress(nextAddress);
        popup.update(
                blankToNull(request.title()),
                blankToNull(request.brandName()),
                request.description(),
                nextCategory,
                nextRegion,
                nextAddress,
                nextDetailAddress,
                geocodingResult == null ? null : geocodingResult.latitude(),
                geocodingResult == null ? null : geocodingResult.longitude(),
                request.startDate(),
                request.endDate(),
                blankToNull(request.openingHours()),
                request.reservationRequired(),
                request.freeAdmission(),
                normalizeEntryFee(nextFreeAdmission, nextEntryFee),
                request.officialUrl(),
                request.reservationUrl(),
                request.thumbnailUrl(),
                request.visible()
        );
        return AdminPopupResponse.from(popup);
    }

    @Transactional
    public void deletePopup(Long popupId) {
        Popup popup = getAdminPopupEntity(popupId);
        popupRepository.delete(popup);
    }

    @Transactional
    public PopupVisibilityResponse changeVisibility(Long popupId, boolean visible) {
        Popup popup = getAdminPopupEntity(popupId);
        popup.changeVisibility(visible);
        return PopupVisibilityResponse.from(popup);
    }

    private Popup getAdminPopupEntity(Long popupId) {
        return popupRepository.findById(popupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "팝업을 찾을 수 없습니다."));
    }

    private void validateCreateRequest(String region, String category, PopupCreateRequest request) {
        validatePopupClassifications(region, category);
        validateDateRange(request.startDate(), request.endDate());
        validateAdmission(request.freeAdmission(), request.entryFee());
    }

    private void validatePopupClassifications(String region, String category) {
        popupClassificationService.validateActiveClassification(PopupClassificationType.REGION, region, "지역");
        popupClassificationService.validateActiveClassification(PopupClassificationType.CATEGORY, category, "카테고리");
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "운영 시작일은 종료일보다 늦을 수 없습니다.");
        }
    }

    private void validateAdmission(boolean freeAdmission, Integer entryFee) {
        if (freeAdmission && entryFee != null && entryFee > 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "무료 입장 팝업의 입장료는 비어 있거나 0이어야 합니다.");
        }
        if (!freeAdmission && entryFee != null && entryFee < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "입장료는 0 이상이어야 합니다.");
        }
    }

    private Integer normalizeEntryFee(boolean freeAdmission, Integer entryFee) {
        if (freeAdmission && (entryFee == null || entryFee == 0)) {
            return null;
        }
        return entryFee;
    }

    private String normalizeRequiredClassificationCode(String code, String fieldName) {
        String normalizedCode = normalizeClassificationCode(code);
        if (normalizedCode == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, fieldName + " 코드는 비어 있을 수 없습니다.");
        }
        return normalizedCode;
    }

    private String normalizeClassificationCode(String code) {
        String normalizedCode = blankToNull(code);
        return normalizedCode == null ? null : normalizedCode.toUpperCase();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
