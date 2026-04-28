package com.example.popupmapapi.popup.service;

import com.example.popupmapapi.admin.web.dto.PopupClassificationCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupClassificationResponse;
import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.common.error.ErrorCode;
import com.example.popupmapapi.popup.domain.PopupClassification;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import com.example.popupmapapi.popup.persistence.PopupClassificationRepository;
import com.example.popupmapapi.popup.persistence.PopupRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupClassificationService {

    private final PopupClassificationRepository popupClassificationRepository;
    private final PopupRepository popupRepository;

    public List<PopupClassificationResponse> getClassifications(PopupClassificationType type, boolean activeOnly) {
        List<PopupClassification> classifications = activeOnly
                ? popupClassificationRepository.findByTypeAndActiveTrueOrderBySortOrderAscCodeAsc(type)
                : popupClassificationRepository.findByTypeOrderBySortOrderAscCodeAsc(type);

        return classifications.stream()
                .map(PopupClassificationResponse::from)
                .toList();
    }

    @Transactional
    public PopupClassificationResponse createClassification(PopupClassificationCreateRequest request) {
        String normalizedCode = request.code().trim().toUpperCase();
        if (popupClassificationRepository.existsByTypeAndCode(request.type(), normalizedCode)) {
            throw new BusinessException(ErrorCode.CONFLICT, "이미 등록된 분류 코드입니다.");
        }

        PopupClassification classification = popupClassificationRepository.save(PopupClassification.builder()
                .type(request.type())
                .code(normalizedCode)
                .label(request.label().trim())
                .sortOrder(request.sortOrder())
                .active(request.active())
                .build());

        return PopupClassificationResponse.from(classification);
    }

    public void validateActiveClassification(PopupClassificationType type, String code, String fieldName) {
        if (!popupClassificationRepository.existsByTypeAndCodeAndActiveTrue(type, code)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, fieldName + " 코드가 등록되어 있지 않습니다.");
        }
    }

    @Transactional
    public void deleteClassification(Long classificationId) {
        PopupClassification classification = popupClassificationRepository.findById(classificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "분류 코드를 찾을 수 없습니다."));

        if (isClassificationInUse(classification)) {
            throw new BusinessException(ErrorCode.CONFLICT, "이미 팝업에서 사용 중인 분류 코드는 삭제할 수 없습니다.");
        }

        popupClassificationRepository.delete(classification);
    }

    private boolean isClassificationInUse(PopupClassification classification) {
        if (classification.getType() == PopupClassificationType.REGION) {
            return popupRepository.existsByRegion(classification.getCode());
        }
        return popupRepository.existsByCategory(classification.getCode());
    }
}
