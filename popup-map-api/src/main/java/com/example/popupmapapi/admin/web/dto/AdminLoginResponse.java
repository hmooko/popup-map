package com.example.popupmapapi.admin.web.dto;

public record AdminLoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
