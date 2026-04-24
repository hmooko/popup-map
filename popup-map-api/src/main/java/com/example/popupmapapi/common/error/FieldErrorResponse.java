package com.example.popupmapapi.common.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}
