package com.example.popupmapapi.admin.web;

import com.example.popupmapapi.admin.service.AdminAuthService;
import com.example.popupmapapi.admin.web.dto.AdminLoginRequest;
import com.example.popupmapapi.admin.web.dto.AdminLoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin Auth", description = "관리자 인증 API")
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    @Operation(summary = "관리자 로그인", description = "이메일과 비밀번호로 로그인하고 관리자 JWT를 발급합니다.")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }
}
