package com.example.popupmapapi.admin.web;

import com.example.popupmapapi.admin.web.dto.AdminPopupResponse;
import com.example.popupmapapi.admin.web.dto.PopupCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupUpdateRequest;
import com.example.popupmapapi.admin.web.dto.PopupVisibilityRequest;
import com.example.popupmapapi.admin.web.dto.PopupVisibilityResponse;
import com.example.popupmapapi.popup.service.PopupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin Popup", description = "관리자용 팝업 관리 API")
@SecurityRequirement(name = "adminBearerAuth")
@RequestMapping("/api/v1/admin/popups")
public class AdminPopupController {

    private final PopupService popupService;

    @GetMapping
    @Operation(summary = "관리자 팝업 목록 조회", description = "공개 여부와 무관하게 전체 팝업 목록을 조회합니다.")
    public List<AdminPopupResponse> getAdminPopups(@RequestParam(required = false) String q) {
        return popupService.getAdminPopups(q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "팝업 등록", description = "새 팝업스토어를 등록합니다.")
    public AdminPopupResponse createPopup(@Valid @RequestBody PopupCreateRequest request) {
        return popupService.createPopup(request);
    }

    @PatchMapping("/{popupId}")
    @Operation(summary = "팝업 수정", description = "기존 팝업스토어 정보를 수정합니다.")
    public AdminPopupResponse updatePopup(
            @PathVariable Long popupId,
            @Valid @RequestBody PopupUpdateRequest request
    ) {
        return popupService.updatePopup(popupId, request);
    }

    @DeleteMapping("/{popupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "팝업 삭제", description = "팝업스토어를 삭제합니다.")
    public void deletePopup(@PathVariable Long popupId) {
        popupService.deletePopup(popupId);
    }

    @PatchMapping("/{popupId}/visibility")
    @Operation(summary = "팝업 노출 상태 변경", description = "팝업 노출 여부를 변경합니다.")
    public PopupVisibilityResponse changeVisibility(
            @PathVariable Long popupId,
            @Valid @RequestBody PopupVisibilityRequest request
    ) {
        return popupService.changeVisibility(popupId, request.visible());
    }
}
