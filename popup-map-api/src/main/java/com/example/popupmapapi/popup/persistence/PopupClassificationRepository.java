package com.example.popupmapapi.popup.persistence;

import com.example.popupmapapi.popup.domain.PopupClassification;
import com.example.popupmapapi.popup.domain.PopupClassificationType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupClassificationRepository extends JpaRepository<PopupClassification, Long> {

    boolean existsByTypeAndCodeAndActiveTrue(PopupClassificationType type, String code);

    boolean existsByTypeAndCode(PopupClassificationType type, String code);

    List<PopupClassification> findByTypeOrderBySortOrderAscCodeAsc(PopupClassificationType type);

    List<PopupClassification> findByTypeAndActiveTrueOrderBySortOrderAscCodeAsc(PopupClassificationType type);
}
