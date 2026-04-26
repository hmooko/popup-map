package com.example.popupmapapi.admin.web.dto;

import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.Region;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.hibernate.validator.constraints.URL;

public record PopupUpdateRequest(
        @Size(max = 120) String title,
        @Size(max = 120) String brandName,
        String description,
        Category category,
        Region region,
        @Size(max = 255) String address,
        @Size(max = 255) String detailAddress,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max = 80) String openingHours,
        Boolean reservationRequired,
        Boolean freeAdmission,
        @Min(0) Integer entryFee,
        @URL @Size(max = 500) String officialUrl,
        @URL @Size(max = 500) String reservationUrl,
        @URL @Size(max = 500) String thumbnailUrl,
        Boolean visible
) {
}
