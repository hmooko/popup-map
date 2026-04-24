package com.example.popupmapapi.popup.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "popup")
public class Popup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 120)
    private String brandName;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Region region;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 80)
    private String openingHours;

    @Column(nullable = false)
    private boolean reservationRequired;

    @Column(nullable = false)
    private boolean freeAdmission;

    private Integer entryFee;

    @Column(length = 500)
    private String officialUrl;

    @Column(length = 500)
    private String reservationUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    private boolean visible = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Popup(
            String title,
            String brandName,
            String description,
            Category category,
            Region region,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            LocalDate startDate,
            LocalDate endDate,
            String openingHours,
            boolean reservationRequired,
            boolean freeAdmission,
            Integer entryFee,
            String officialUrl,
            String reservationUrl,
            String thumbnailUrl,
            boolean visible
    ) {
        this.title = title;
        this.brandName = brandName;
        this.description = description;
        this.category = category;
        this.region = region;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.startDate = startDate;
        this.endDate = endDate;
        this.openingHours = openingHours;
        this.reservationRequired = reservationRequired;
        this.freeAdmission = freeAdmission;
        this.entryFee = entryFee;
        this.officialUrl = officialUrl;
        this.reservationUrl = reservationUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.visible = visible;
    }

    public void update(
            String title,
            String brandName,
            String description,
            Category category,
            Region region,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            LocalDate startDate,
            LocalDate endDate,
            String openingHours,
            Boolean reservationRequired,
            Boolean freeAdmission,
            Integer entryFee,
            String officialUrl,
            String reservationUrl,
            String thumbnailUrl,
            Boolean visible
    ) {
        if (title != null) {
            this.title = title;
        }
        if (brandName != null) {
            this.brandName = brandName;
        }
        if (description != null) {
            this.description = description;
        }
        if (category != null) {
            this.category = category;
        }
        if (region != null) {
            this.region = region;
        }
        if (address != null) {
            this.address = address;
        }
        if (latitude != null) {
            this.latitude = latitude;
        }
        if (longitude != null) {
            this.longitude = longitude;
        }
        if (startDate != null) {
            this.startDate = startDate;
        }
        if (endDate != null) {
            this.endDate = endDate;
        }
        if (openingHours != null) {
            this.openingHours = openingHours;
        }
        if (reservationRequired != null) {
            this.reservationRequired = reservationRequired;
        }
        if (freeAdmission != null) {
            this.freeAdmission = freeAdmission;
        }
        if (entryFee != null || Boolean.TRUE.equals(freeAdmission)) {
            this.entryFee = entryFee;
        }
        if (officialUrl != null) {
            this.officialUrl = officialUrl;
        }
        if (reservationUrl != null) {
            this.reservationUrl = reservationUrl;
        }
        if (thumbnailUrl != null) {
            this.thumbnailUrl = thumbnailUrl;
        }
        if (visible != null) {
            this.visible = visible;
        }
    }

    public void changeVisibility(boolean visible) {
        this.visible = visible;
    }
}
