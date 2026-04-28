package com.example.popupmapapi.popup.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.popup.domain.PopupClassification;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import com.example.popupmapapi.popup.persistence.PopupClassificationRepository;
import com.example.popupmapapi.popup.persistence.PopupRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PopupClassificationServiceTest {

    @Mock
    private PopupClassificationRepository popupClassificationRepository;

    @Mock
    private PopupRepository popupRepository;

    @InjectMocks
    private PopupClassificationService popupClassificationService;

    @Test
    void deleteClassificationRemovesUnusedRegionCode() {
        PopupClassification classification = PopupClassification.builder()
                .type(PopupClassificationType.REGION)
                .code("SEONGSU_SIDE")
                .label("성수 사이드")
                .build();

        when(popupClassificationRepository.findById(1L)).thenReturn(Optional.of(classification));
        when(popupRepository.existsByRegion("SEONGSU_SIDE")).thenReturn(false);

        popupClassificationService.deleteClassification(1L);

        verify(popupClassificationRepository).delete(classification);
    }

    @Test
    void deleteClassificationRejectsUsedCategoryCode() {
        PopupClassification classification = PopupClassification.builder()
                .type(PopupClassificationType.CATEGORY)
                .code("FASHION")
                .label("패션")
                .build();

        when(popupClassificationRepository.findById(2L)).thenReturn(Optional.of(classification));
        when(popupRepository.existsByCategory("FASHION")).thenReturn(true);

        assertThatThrownBy(() -> popupClassificationService.deleteClassification(2L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사용 중인 분류 코드는 삭제할 수 없습니다");

        verify(popupClassificationRepository, never()).delete(classification);
    }
}
