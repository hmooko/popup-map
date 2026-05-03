package com.example.popupmapapi.popup.persistence;

import com.example.popupmapapi.popup.domain.Popup;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
              and (:applyOpenOnDate = false or (p.startDate <= :openOnDate and p.endDate >= :openOnDate))
              and (:applyStartDateFrom = false or p.startDate >= :startDateFrom)
              and (:applyDateFrom = false or p.endDate >= :dateFrom)
              and (:applyDateTo = false or p.startDate <= :dateTo)
            order by
              case when p.startDate <= :today and p.endDate >= :today then 0 else 1 end,
              p.endDate asc,
              p.createdAt desc
            """)
    Page<Popup> searchPublicPopups(
            @Param("region") String region,
            @Param("category") String category,
            @Param("reservationRequired") Boolean reservationRequired,
            @Param("freeOnly") boolean freeOnly,
            @Param("applyOpenOnDate") boolean applyOpenOnDate,
            @Param("openOnDate") LocalDate openOnDate,
            @Param("applyStartDateFrom") boolean applyStartDateFrom,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("applyDateFrom") boolean applyDateFrom,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("applyDateTo") boolean applyDateTo,
            @Param("dateTo") LocalDate dateTo,
            @Param("today") LocalDate today,
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

    @Query("""
            select p
            from Popup p
            where lower(p.title) like lower(concat('%', :keyword, '%'))
               or lower(p.brandName) like lower(concat('%', :keyword, '%'))
               or lower(p.address) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(p.detailAddress, '')) like lower(concat('%', :keyword, '%'))
            order by p.updatedAt desc, p.createdAt desc
            """)
    List<Popup> searchAdminPopups(@Param("keyword") String keyword);

    boolean existsByRegion(String region);

    boolean existsByCategory(String category);

    default List<Popup> findAllAdminPopups() {
        return findAll(Sort.by(
                Sort.Order.desc("updatedAt"),
                Sort.Order.desc("createdAt")
        ));
    }
}
