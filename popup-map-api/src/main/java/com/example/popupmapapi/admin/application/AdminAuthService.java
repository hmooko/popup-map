package com.example.popupmapapi.admin.application;

import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.common.error.ErrorCode;
import com.example.popupmapapi.admin.security.AdminSecurityProperties;
import com.example.popupmapapi.admin.web.AdminLoginRequest;
import com.example.popupmapapi.admin.web.AdminLoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminSecurityProperties properties;

    public AdminLoginResponse login(AdminLoginRequest request) {
        if (!properties.email().equals(request.email()) || !properties.password().equals(request.password())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return new AdminLoginResponse(properties.token(), "Bearer", properties.expiresIn());
    }
}
