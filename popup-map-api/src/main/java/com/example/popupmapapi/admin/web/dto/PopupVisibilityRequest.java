package com.example.popupmapapi.admin.web.dto;

import jakarta.validation.constraints.NotNull;

public record PopupVisibilityRequest(@NotNull Boolean visible) {
}
