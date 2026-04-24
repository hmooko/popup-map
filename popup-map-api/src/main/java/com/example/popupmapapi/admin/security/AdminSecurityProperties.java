package com.example.popupmapapi.admin.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.admin")
public record AdminSecurityProperties(
        String email,
        String password,
        String token,
        long expiresIn
) {
}
