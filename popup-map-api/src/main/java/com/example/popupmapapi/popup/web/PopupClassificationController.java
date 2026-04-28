package com.example.popupmapapi.popup.web;

import com.example.popupmapapi.admin.web.dto.PopupClassificationResponse;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import com.example.popupmapapi.popup.service.PopupClassificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Popup Classification", description = "팝업 지역/카테고리 코드 조회 API")
@RequestMapping("/api/v1/popup-classifications")
public class PopupClassificationController {

    private final PopupClassificationService popupClassificationService;

    @GetMapping
    @Operation(summary = "활성 분류 코드 목록 조회", description = "지역/카테고리 활성 코드 목록을 조회합니다.")
    public List<PopupClassificationResponse> getActivePopupClassifications(@RequestParam PopupClassificationType type) {
        return popupClassificationService.getClassifications(type, true);
    }
}
