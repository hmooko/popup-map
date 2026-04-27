package com.example.popupmapapi.popup.domain;

import java.time.LocalDate;

public enum PopupStatus {
    ONGOING,
    UPCOMING,
    CLOSING_SOON;

    private static final int CLOSING_SOON_DAYS = 7;

    public static PopupStatus from(LocalDate startDate, LocalDate endDate, LocalDate today) {
        if (startDate.isAfter(today)) {
            return UPCOMING;
        }

        if (!endDate.isBefore(today) && !endDate.isAfter(today.plusDays(CLOSING_SOON_DAYS))) {
            return CLOSING_SOON;
        }

        return ONGOING;
    }
}
