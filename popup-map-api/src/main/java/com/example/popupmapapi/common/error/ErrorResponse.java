package com.example.popupmapapi.common.error;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String code,
        String message,
        List<FieldErrorResponse> errors
) {
    public static ErrorResponse of(ErrorCode errorCode, String message, List<FieldErrorResponse> errors) {
        return new ErrorResponse(
                LocalDateTime.now(),
                errorCode.status().value(),
                errorCode.name(),
                message,
                errors
        );
    }
}
