package com.example.popupmapapi.admin.web;

import com.example.popupmapapi.admin.web.dto.PopupClassificationCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupClassificationResponse;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import com.example.popupmapapi.popup.service.PopupClassificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin Popup Classification", description = "관리자용 팝업 지역/카테고리 코드 관리 API")
@SecurityRequirement(name = "adminBearerAuth")
@RequestMapping("/api/v1/admin/popup-classifications")
public class AdminPopupClassificationController {

    private final PopupClassificationService popupClassificationService;

    @GetMapping
    @Operation(summary = "분류 코드 목록 조회", description = "지역/카테고리 코드 목록을 조회합니다.")
    public List<PopupClassificationResponse> getPopupClassifications(
            @RequestParam PopupClassificationType type,
            @RequestParam(defaultValue = "false") boolean activeOnly
    ) {
        return popupClassificationService.getClassifications(type, activeOnly);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "분류 코드 추가", description = "새 지역/카테고리 코드를 추가합니다.")
    public PopupClassificationResponse createPopupClassification(
            @Valid @RequestBody PopupClassificationCreateRequest request
    ) {
        return popupClassificationService.createClassification(request);
    }

    @DeleteMapping("/{classificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "분류 코드 삭제", description = "사용 중이지 않은 지역/카테고리 코드를 삭제합니다.")
    public void deletePopupClassification(@PathVariable Long classificationId) {
        popupClassificationService.deleteClassification(classificationId);
    }
}
