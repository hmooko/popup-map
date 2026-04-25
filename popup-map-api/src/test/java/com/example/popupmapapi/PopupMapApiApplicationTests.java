package com.example.popupmapapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.popupmapapi.admin.domain.AdminRole;
import com.example.popupmapapi.admin.domain.AdminUser;
import com.example.popupmapapi.admin.persistence.AdminUserRepository;
import com.example.popupmapapi.admin.security.AdminJwtTokenProvider;
import com.example.popupmapapi.admin.service.AdminAuthService;
import com.example.popupmapapi.admin.web.dto.AdminLoginRequest;
import com.example.popupmapapi.common.error.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PopupMapApiApplicationTests {

    @Autowired
    private AdminJwtTokenProvider adminJwtTokenProvider;

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
    }

    @Test
    void adminJwtTokenCanBeCreatedAndValidated() {
        String token = adminJwtTokenProvider.createToken("admin@example.com");

        assertThat(token.split("\\.")).hasSize(3);
        assertThat(adminJwtTokenProvider.isValidAdminToken(token)).isTrue();
        assertThat(adminJwtTokenProvider.getValidAdminEmail(token)).contains("admin@example.com");
    }

    @Test
    void tamperedAdminJwtTokenIsRejected() {
        String token = adminJwtTokenProvider.createToken("admin@example.com");
        String replacement = token.endsWith("x") ? "y" : "x";
        String tamperedToken = token.substring(0, token.length() - 1) + replacement;

        assertThat(adminJwtTokenProvider.isValidAdminToken(tamperedToken)).isFalse();
    }

    @Test
    void adminLoginUsesAdminUserTable() {
        adminUserRepository.save(AdminUser.create(
                "db-admin@example.com",
                passwordEncoder.encode("secure-password"),
                AdminRole.ADMIN
        ));

        String accessToken = adminAuthService.login(
                new AdminLoginRequest("db-admin@example.com", "secure-password")
        ).accessToken();

        assertThat(adminJwtTokenProvider.getValidAdminEmail(accessToken)).contains("db-admin@example.com");
    }

    @Test
    void adminLoginRejectsWrongPassword() {
        adminUserRepository.save(AdminUser.create(
                "wrong-password@example.com",
                passwordEncoder.encode("secure-password"),
                AdminRole.ADMIN
        ));

        assertThatThrownBy(() -> adminAuthService.login(
                new AdminLoginRequest("wrong-password@example.com", "wrong-password")
        )).isInstanceOf(BusinessException.class);
    }
}
