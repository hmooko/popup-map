package com.example.popupmapapi.admin.web;

public record AdminLoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
