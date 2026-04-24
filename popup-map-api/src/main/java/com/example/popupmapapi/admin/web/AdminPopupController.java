package com.example.popupmapapi.admin.web;

import com.example.popupmapapi.admin.web.dto.AdminPopupResponse;
import com.example.popupmapapi.admin.web.dto.PopupCreateRequest;
import com.example.popupmapapi.admin.web.dto.PopupUpdateRequest;
import com.example.popupmapapi.admin.web.dto.PopupVisibilityRequest;
import com.example.popupmapapi.admin.web.dto.PopupVisibilityResponse;
import com.example.popupmapapi.popup.service.PopupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/popups")
public class AdminPopupController {

    private final PopupService popupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminPopupResponse createPopup(@Valid @RequestBody PopupCreateRequest request) {
        return popupService.createPopup(request);
    }

    @PatchMapping("/{popupId}")
    public AdminPopupResponse updatePopup(
            @PathVariable Long popupId,
            @Valid @RequestBody PopupUpdateRequest request
    ) {
        return popupService.updatePopup(popupId, request);
    }

    @DeleteMapping("/{popupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePopup(@PathVariable Long popupId) {
        popupService.deletePopup(popupId);
    }

    @PatchMapping("/{popupId}/visibility")
    public PopupVisibilityResponse changeVisibility(
            @PathVariable Long popupId,
            @Valid @RequestBody PopupVisibilityRequest request
    ) {
        return popupService.changeVisibility(popupId, request.visible());
    }
}
