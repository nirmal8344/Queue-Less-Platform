package com.queueless.queueless.repository;

import com.queueless.queueless.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByBranchId(Long branchId);
    List<Holiday> findByBranchIdOrBranchIdIsNull(Long branchId);
    boolean existsByBranchIdAndHolidayDate(Long branchId, LocalDate holidayDate);
    boolean existsByBranchIdIsNullAndHolidayDate(LocalDate holidayDate);
}
