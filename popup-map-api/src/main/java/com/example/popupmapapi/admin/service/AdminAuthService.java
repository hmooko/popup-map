package com.example.popupmapapi.admin.service;

import com.example.popupmapapi.admin.domain.AdminRole;
import com.example.popupmapapi.admin.domain.AdminUser;
import com.example.popupmapapi.admin.persistence.AdminUserRepository;
import com.example.popupmapapi.admin.security.AdminJwtTokenProvider;
import com.example.popupmapapi.admin.web.dto.AdminLoginRequest;
import com.example.popupmapapi.admin.web.dto.AdminLoginResponse;
import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final AdminJwtTokenProvider adminJwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AdminLoginResponse login(AdminLoginRequest request) {
        AdminUser adminUser = adminUserRepository.findByEmail(request.email())
                .filter(user -> user.getRole() == AdminRole.ADMIN)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), adminUser.getPasswordHash())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return new AdminLoginResponse(
                adminJwtTokenProvider.createToken(adminUser.getEmail()),
                "Bearer",
                adminJwtTokenProvider.expiresIn()
        );
    }
}
