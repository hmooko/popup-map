package com.example.popupmapapi.admin.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.hibernate.validator.constraints.URL;

public record PopupCreateRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 120) String brandName,
        String description,
        @NotBlank @Size(max = 50) String category,
        @NotBlank @Size(max = 50) String region,
        @NotBlank @Size(max = 255) String address,
        @Size(max = 255) String detailAddress,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank @Size(max = 80) String openingHours,
        @NotNull Boolean reservationRequired,
        @NotNull Boolean freeAdmission,
        @Min(0) Integer entryFee,
        @URL @Size(max = 500) String officialUrl,
        @URL @Size(max = 500) String reservationUrl,
        @URL @Size(max = 500) String thumbnailUrl,
        Boolean visible
) {
}
