package com.example.popupmapapi.popup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.popupmapapi.admin.web.dto.PopupCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupUpdateRequest;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.PopupStatus;
import com.example.popupmapapi.popup.persistence.PopupRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PopupServiceTest {

    @Test
    void popupStatusUsesSingleBackendRule() {
        LocalDate today = LocalDate.of(2026, 4, 27);

        assertThat(PopupStatus.from(today.minusDays(2), today.plusDays(10), today)).isEqualTo(PopupStatus.ONGOING);
        assertThat(PopupStatus.from(today.plusDays(1), today.plusDays(5), today)).isEqualTo(PopupStatus.UPCOMING);
        assertThat(PopupStatus.from(today.minusDays(3), today.plusDays(7), today)).isEqualTo(PopupStatus.CLOSING_SOON);
    }

    @Mock
    private PopupRepository popupRepository;

    @Mock
    private GeocodingService geocodingService;

    @Mock
    private PopupClassificationService popupClassificationService;

    @InjectMocks
    private PopupService popupService;

    @Test
    void createPopupGeocodesAddressBeforeSaving() {
        PopupCreateRequest request = new PopupCreateRequest(
                "Ader Archive Popup",
                "Ader",
                "설명",
                "FASHION",
                "SEONGSU",
                "서울 성동구 연무장길 00",
                "1층 팝업존",
                LocalDate.of(2026, 4, 20),
                LocalDate.of(2026, 5, 12),
                "11:00-20:00",
                false,
                true,
                null,
                "https://example.com",
                null,
                null,
                true
        );

        when(geocodingService.geocodeAddress(request.address()))
                .thenReturn(new GeocodingResult(new BigDecimal("37.5446"), new BigDecimal("127.0557")));
        when(popupRepository.save(any(Popup.class))).thenAnswer(invocation -> invocation.getArgument(0));

        popupService.createPopup(request);

        ArgumentCaptor<Popup> captor = ArgumentCaptor.forClass(Popup.class);
        verify(popupRepository).save(captor.capture());
        Popup savedPopup = captor.getValue();
        assertThat(savedPopup.getAddress()).isEqualTo(request.address());
        assertThat(savedPopup.getDetailAddress()).isEqualTo(request.detailAddress());
        assertThat(savedPopup.getLatitude()).isEqualByComparingTo("37.5446");
        assertThat(savedPopup.getLongitude()).isEqualByComparingTo("127.0557");
    }

    @Test
    void updatePopupRegeocodesWhenAddressChanges() {
        Popup popup = Popup.builder()
                .title("기존 팝업")
                .brandName("브랜드")
                .description("설명")
                .category("FASHION")
                .region("SEONGSU")
                .address("서울 성동구 연무장길 00")
                .detailAddress("1층 팝업존")
                .latitude(new BigDecimal("37.5446"))
                .longitude(new BigDecimal("127.0557"))
                .startDate(LocalDate.of(2026, 4, 20))
                .endDate(LocalDate.of(2026, 5, 12))
                .openingHours("11:00-20:00")
                .reservationRequired(false)
                .freeAdmission(true)
                .entryFee(null)
                .visible(true)
                .build();

        PopupUpdateRequest request = new PopupUpdateRequest(
                null,
                null,
                null,
                null,
                null,
                "서울 마포구 와우산로 00",
                "2층 굿즈 마켓",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(popupRepository.findById(1L)).thenReturn(Optional.of(popup));
        when(geocodingService.geocodeAddress(request.address()))
                .thenReturn(new GeocodingResult(new BigDecimal("37.5563"), new BigDecimal("126.9237")));

        popupService.updatePopup(1L, request);

        assertThat(popup.getAddress()).isEqualTo("서울 마포구 와우산로 00");
        assertThat(popup.getDetailAddress()).isEqualTo("2층 굿즈 마켓");
        assertThat(popup.getLatitude()).isEqualByComparingTo("37.5563");
        assertThat(popup.getLongitude()).isEqualByComparingTo("126.9237");
    }
}
