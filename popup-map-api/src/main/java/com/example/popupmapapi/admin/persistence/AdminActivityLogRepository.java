package com.example.popupmapapi.admin.persistence;

import com.example.popupmapapi.admin.domain.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
}
