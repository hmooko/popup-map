package com.example.popupmapapi.popup.persistence;

import com.example.popupmapapi.popup.domain.Category;
import com.example.popupmapapi.popup.domain.Popup;
import com.example.popupmapapi.popup.domain.Region;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PopupRepository extends JpaRepository<Popup, Long> {

    @Query("""
            select p
            from Popup p
            where p.visible = true
              and p.endDate >= :today
              and (:region is null or p.region = :region)
              and (:category is null or p.category = :category)
              and (:reservationRequired is null or p.reservationRequired = :reservationRequired)
              and (:freeOnly = false or p.freeAdmission = true)
              and (:startDate is null or p.endDate >= :startDate)
              and (:endDate is null or p.startDate <= :endDate)
              and (
                    :status is null
                    or (:status = 'ONGOING' and p.startDate <= :today and p.endDate >= :today)
                    or (:status = 'UPCOMING' and p.startDate > :today)
                    or (
                        :status = 'CLOSING_SOON'
                        and p.startDate <= :today
                        and p.endDate between :today and :closingSoonDate
                    )
              )
            order by
              case when p.startDate <= :today and p.endDate >= :today then 0 else 1 end,
              p.endDate asc,
              p.createdAt desc
            """)
    Page<Popup> searchPublicPopups(
            @Param("region") Region region,
            @Param("category") Category category,
            @Param("status") String status,
            @Param("reservationRequired") Boolean reservationRequired,
            @Param("freeOnly") boolean freeOnly,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("today") LocalDate today,
            @Param("closingSoonDate") LocalDate closingSoonDate,
            Pageable pageable
    );

    Optional<Popup> findByIdAndVisibleTrue(Long id);

    @Query("""
            select p
            from Popup p
            where p.visible = true
              and p.endDate >= :today
              and p.latitude between :southWestLat and :northEastLat
              and p.longitude between :southWestLng and :northEastLng
            order by p.endDate asc, p.createdAt desc
            """)
    List<Popup> findVisibleInBounds(
            @Param("southWestLat") BigDecimal southWestLat,
            @Param("southWestLng") BigDecimal southWestLng,
            @Param("northEastLat") BigDecimal northEastLat,
            @Param("northEastLng") BigDecimal northEastLng,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    @Query(
            value = """
                    select p.*
                    from popup p
                    where p.visible = true
                      and p.end_date >= :today
                      and ST_DWithin(
                            p.location,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                            :radiusMeter
                      )
                    order by ST_Distance(
                            p.location,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                    ) asc
                    """,
            nativeQuery = true
    )
    List<Popup> findVisibleNearby(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radiusMeter") int radiusMeter,
            @Param("today") LocalDate today
    );
}
