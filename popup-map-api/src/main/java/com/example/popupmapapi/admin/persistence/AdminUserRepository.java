package com.example.popupmapapi.admin.persistence;

import com.example.popupmapapi.admin.domain.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
}
