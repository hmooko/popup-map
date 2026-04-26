package com.example.popupmapapi.popup.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.kakao.local")
public record KakaoLocalProperties(
        String baseUrl,
        String restApiKey
) {
}
