package com.example.popupmapapi.admin.web.dto;

import com.example.popupmapapi.popup.domain.PopupClassificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PopupClassificationCreateRequest(
        @NotNull PopupClassificationType type,
        @NotBlank
        @Size(max = 50)
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "코드는 대문자, 숫자, 밑줄(_)만 사용할 수 있습니다.")
        String code,
        @NotBlank @Size(max = 100) String label,
        Integer sortOrder,
        Boolean active
) {
}
