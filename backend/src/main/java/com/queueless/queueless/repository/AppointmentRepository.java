package com.queueless.queueless.repository;

import com.queueless.queueless.model.Appointment;
import com.queueless.queueless.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerIdOrderByAppointmentDateDescAppointmentTimeDesc(Long customerId);
    List<Appointment> findByBranchIdAndAppointmentDate(Long branchId, LocalDate appointmentDate);
    List<Appointment> findByBranchId(Long branchId);
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    Optional<Appointment> findByReferenceCode(String referenceCode);

    @Query("SELECT a FROM Appointment a WHERE a.branchId = :branchId AND a.serviceId = :serviceId AND a.appointmentDate = :date AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    List<Appointment> findActiveAppointmentsForSlot(
            @Param("branchId") Long branchId,
            @Param("serviceId") Long serviceId,
            @Param("date") LocalDate date
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.branchId = :branchId AND a.serviceId = :serviceId AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countBookedAtTime(
            @Param("branchId") Long branchId,
            @Param("serviceId") Long serviceId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );

    long countByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);
    long countByAppointmentDate(LocalDate date);
}
