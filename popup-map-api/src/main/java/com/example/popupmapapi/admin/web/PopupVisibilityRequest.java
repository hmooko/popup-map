package com.example.popupmapapi.admin.web;

import jakarta.validation.constraints.NotNull;

public record PopupVisibilityRequest(@NotNull Boolean visible) {
}
