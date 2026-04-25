package com.example.popupmapapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.popupmapapi.admin.security.AdminJwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PopupMapApiApplicationTests {

    @Autowired
    private AdminJwtTokenProvider adminJwtTokenProvider;

    @Test
    void contextLoads() {
    }

    @Test
    void adminJwtTokenCanBeCreatedAndValidated() {
        String token = adminJwtTokenProvider.createToken();

        assertThat(token.split("\\.")).hasSize(3);
        assertThat(adminJwtTokenProvider.isValidAdminToken(token)).isTrue();
    }

    @Test
    void tamperedAdminJwtTokenIsRejected() {
        String token = adminJwtTokenProvider.createToken();
        String replacement = token.endsWith("x") ? "y" : "x";
        String tamperedToken = token.substring(0, token.length() - 1) + replacement;

        assertThat(adminJwtTokenProvider.isValidAdminToken(tamperedToken)).isFalse();
    }
}
