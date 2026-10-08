package com.queueless.queueless.service;

import com.queueless.queueless.dto.AppointmentDTO;
import com.queueless.queueless.dto.AppointmentRequest;
import com.queueless.queueless.dto.AppointmentRescheduleRequest;
import com.queueless.queueless.exception.BadRequestException;
import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.*;
import com.queueless.queueless.repository.AppointmentRepository;
import com.queueless.queueless.repository.BranchRepository;
import com.queueless.queueless.repository.ServiceRepository;
import com.queueless.queueless.repository.UserRepository;
import com.queueless.queueless.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final BranchService branchService;
    private final NotificationService notificationService;
    private final OperationalSettingService settingService;
    private final NotificationRepository notificationRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              BranchRepository branchRepository,
                              ServiceRepository serviceRepository,
                              UserRepository userRepository,
                              BranchService branchService,
                              NotificationService notificationService,
                              OperationalSettingService settingService,
                              NotificationRepository notificationRepository) {
        this.appointmentRepository = appointmentRepository;
        this.branchRepository = branchRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.branchService = branchService;
        this.notificationService = notificationService;
        this.settingService = settingService;
        this.notificationRepository = notificationRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sendScheduledAppointmentReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Appointment> todayAppointments = appointmentRepository.findByAppointmentDate(today);
        for (Appointment apt : todayAppointments) {
            if (apt.getStatus() == AppointmentStatus.CONFIRMED && apt.getAppointmentTime() != null) {
                // Check if appointment is today and reminder not sent yet
                boolean alreadySent = notificationRepository.existsByTypeAndRelatedAppointmentId("APPOINTMENT_REMINDER", apt.getId());
                if (!alreadySent) {
                    Branch branch = branchRepository.findById(apt.getBranchId()).orElse(null);
                    ServiceEntity service = serviceRepository.findById(apt.getServiceId()).orElse(null);
                    String branchName = branch != null ? branch.getName() : "Branch";
                    String serviceName = service != null ? service.getName() : "Service";

                    String msg = String.format("Reminder: You have an upcoming appointment (%s) for %s at %s today at %s.",
                            apt.getReferenceCode(), serviceName, branchName, apt.getAppointmentTime());

                    notificationService.createAndSendNotification(
                            apt.getCustomerId(),
                            "Appointment Reminder",
                            msg,
                            "APPOINTMENT_REMINDER",
                            null,
                            apt.getId()
                    );
                }
            }
        }
    }


    public List<String> getAvailableSlots(Long branchId, Long serviceId, LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            return List.of();
        }

        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!branchService.isBranchOpenOn(branchId, date, null)) {
            return List.of();
        }

        List<Appointment> bookedAppointments = appointmentRepository.findActiveAppointmentsForSlot(branchId, serviceId, date);
        List<LocalTime> bookedTimes = bookedAppointments.stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());

        List<String> availableSlots = new ArrayList<>();
        int stepMinutes = Math.max(15, service.getEstimatedDurationMinutes());
        LocalTime current = branch.getOpeningTime();
        LocalTime close = branch.getClosingTime();

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        while (current.plusMinutes(stepMinutes).isBefore(close) || current.plusMinutes(stepMinutes).equals(close)) {
            // If the date is today, only show future times
            if (!date.isEqual(LocalDate.now()) || current.isAfter(LocalTime.now().plusMinutes(5))) {
                if (!bookedTimes.contains(current)) {
                    availableSlots.add(current.format(timeFmt));
                }
            }
            current = current.plusMinutes(stepMinutes);
        }

        return availableSlots;
    }

    @Transactional
    public AppointmentDTO bookAppointment(Long customerId, AppointmentRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.isActive()) {
            throw new BadRequestException("This service is currently inactive.");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book appointment for a past date.");
        }

        if (!branchService.isBranchOpenOn(branch.getId(), request.getAppointmentDate(), request.getAppointmentTime())) {
            throw new BadRequestException("The branch is closed on this date/time.");
        }

        long existingCount = appointmentRepository.countBookedAtTime(
                request.getBranchId(), request.getServiceId(), request.getAppointmentDate(), request.getAppointmentTime());
        if (existingCount > 0) {
            throw new BadRequestException("This time slot is already booked. Please choose another slot.");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Appointment apt = new Appointment();
        String ref = "APT-" + request.getAppointmentDate().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        apt.setReferenceCode(ref);
        apt.setCustomerId(customerId);
        apt.setBranchId(request.getBranchId());
        apt.setServiceId(request.getServiceId());
        apt.setAppointmentDate(request.getAppointmentDate());
        apt.setAppointmentTime(request.getAppointmentTime());
        apt.setSlotEndTime(request.getAppointmentTime().plusMinutes(service.getEstimatedDurationMinutes()));
        apt.setStatus(AppointmentStatus.CONFIRMED);
        apt.setNotes(request.getNotes());
        apt.setCustomerName(customer.getName());
        apt.setCustomerEmail(customer.getEmail());
        apt.setCustomerPhone(customer.getPhone() != null ? customer.getPhone() : request.getCustomerPhone());

        Appointment saved = appointmentRepository.save(apt);

        // Send confirmation notification
        String msg = String.format("Your appointment (%s) for %s at %s on %s at %s has been confirmed.",
                saved.getReferenceCode(), service.getName(), branch.getName(), saved.getAppointmentDate(), saved.getAppointmentTime());
        notificationService.createAndSendNotification(customerId, "Appointment Confirmed", msg, "APPOINTMENT_CONFIRMED", null, saved.getId());

        return toDTO(saved);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, Long customerId, AppointmentRescheduleRequest request) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!apt.getCustomerId().equals(customerId) && !isStaffOrAdmin(customerId)) {
            throw new BadRequestException("You do not have permission to reschedule this appointment.");
        }

        if (apt.getStatus() == AppointmentStatus.CANCELLED || apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule a " + apt.getStatus() + " appointment.");
        }

        if (request.getNewDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot reschedule to a past date.");
        }

        if (!branchService.isBranchOpenOn(apt.getBranchId(), request.getNewDate(), request.getNewTime())) {
            throw new BadRequestException("The branch is closed on the requested date/time.");
        }

        long existingCount = appointmentRepository.countBookedAtTime(
                apt.getBranchId(), apt.getServiceId(), request.getNewDate(), request.getNewTime());
        if (existingCount > 0) {
            throw new BadRequestException("The requested slot is already booked.");
        }

        ServiceEntity service = serviceRepository.findById(apt.getServiceId()).orElse(null);
        int duration = (service != null) ? service.getEstimatedDurationMinutes() : 15;

        apt.setAppointmentDate(request.getNewDate());
        apt.setAppointmentTime(request.getNewTime());
        apt.setSlotEndTime(request.getNewTime().plusMinutes(duration));
        apt.setStatus(AppointmentStatus.CONFIRMED);

        Appointment saved = appointmentRepository.save(apt);

        Branch branch = branchRepository.findById(saved.getBranchId()).orElse(null);
        String branchName = branch != null ? branch.getName() : "Branch";

        String msg = String.format("Your appointment (%s) has been rescheduled to %s at %s at %s.",
                saved.getReferenceCode(), saved.getAppointmentDate(), saved.getAppointmentTime(), branchName);
        notificationService.createAndSendNotification(apt.getCustomerId(), "Appointment Rescheduled", msg, "APPOINTMENT_RESCHEDULED", null, saved.getId());

        return toDTO(saved);
    }

    @Transactional
    public AppointmentDTO cancelAppointment(Long id, Long customerId, String reason) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!apt.getCustomerId().equals(customerId) && !isStaffOrAdmin(customerId)) {
            throw new BadRequestException("You do not have permission to cancel this appointment.");
        }

        if (apt.getStatus() == AppointmentStatus.CANCELLED || apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an appointment that is already " + apt.getStatus());
        }

        apt.setStatus(AppointmentStatus.CANCELLED);
        apt.setCancelledAt(LocalDateTime.now());
        apt.setCancellationReason(reason != null ? reason : "Cancelled by user");

        Appointment saved = appointmentRepository.save(apt);

        String msg = String.format("Your appointment (%s) has been cancelled.", saved.getReferenceCode());
        notificationService.createAndSendNotification(apt.getCustomerId(), "Appointment Cancelled", msg, "APPOINTMENT_CANCELLED", null, saved.getId());

        return toDTO(saved);
    }

    public List<AppointmentDTO> getCustomerAppointments(Long customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDescAppointmentTimeDesc(customerId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getBranchAppointments(Long branchId, LocalDate date) {
        List<Appointment> list = (date != null) ?
                appointmentRepository.findByBranchIdAndAppointmentDate(branchId, date) :
                appointmentRepository.findByBranchId(branchId);
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAllAppointments(LocalDate date) {
        List<Appointment> list = (date != null) ?
                appointmentRepository.findByAppointmentDate(date) :
                appointmentRepository.findAll();
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AppointmentDTO getById(Long id) {
        return toDTO(appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id)));
    }

    public AppointmentDTO getByReferenceCode(String refCode) {
        return toDTO(appointmentRepository.findByReferenceCode(refCode)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with reference: " + refCode)));
    }

    private boolean isStaffOrAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getRole() == Role.STAFF || u.getRole() == Role.ADMIN)
                .orElse(false);
    }

    public AppointmentDTO toDTO(Appointment a) {
        String branchName = branchRepository.findById(a.getBranchId())
                .map(Branch::getName).orElse("Branch #" + a.getBranchId());
        ServiceEntity service = serviceRepository.findById(a.getServiceId()).orElse(null);
        String serviceName = service != null ? service.getName() : "Service #" + a.getServiceId();
        int duration = service != null ? service.getEstimatedDurationMinutes() : 15;

        return AppointmentDTO.fromEntity(a, branchName, serviceName, duration);
    }
}
