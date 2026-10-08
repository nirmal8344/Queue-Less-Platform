package com.queueless.queueless.config;

import com.queueless.queueless.model.*;
import com.queueless.queueless.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final CounterRepository counterRepository;
    private final CounterServiceRepository counterServiceRepository;
    private final UserRepository userRepository;
    private final OperationalSettingRepository settingRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${seed.admin.password:}")
    private String seedAdminPassword;

    @Value("${seed.staff.password:}")
    private String seedStaffPassword;

    public DataInitializer(OrganizationRepository organizationRepository,
                           BranchRepository branchRepository,
                           ServiceRepository serviceRepository,
                           CounterRepository counterRepository,
                           CounterServiceRepository counterServiceRepository,
                           UserRepository userRepository,
                           OperationalSettingRepository settingRepository,
                           QueueTokenRepository queueTokenRepository,
                           AppointmentRepository appointmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.serviceRepository = serviceRepository;
        this.counterRepository = counterRepository;
        this.counterServiceRepository = counterServiceRepository;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminPass = (seedAdminPassword != null && !seedAdminPassword.trim().isEmpty()) ? seedAdminPassword : "AdminPass@123";
        String staffPass = (seedStaffPassword != null && !seedStaffPassword.trim().isEmpty()) ? seedStaffPassword : "StaffPass@123";
        String customerPass = "customer123";

        // Seed Admin Account
        if (userRepository.findByEmail("admin@queueless.com").isEmpty()) {
            User admin = new User("System Admin", "admin@queueless.com",
                    passwordEncoder.encode(adminPass), "+91 98400 00001", Role.ADMIN);
            userRepository.save(admin);
        }

        // Seed Primary Staff Account
        if (userRepository.findByEmail("staff@queueless.com").isEmpty()) {
            User staff = new User("Primary Staff", "staff@queueless.com",
                    passwordEncoder.encode(staffPass), "+91 98400 00002", Role.STAFF);
            userRepository.save(staff);
        }

        // Initialize Operational Settings if missing
        if (settingRepository.count() == 0) {
            settingRepository.save(new OperationalSetting("CANCELLATION_MINUTES_BEFORE", "60", "Minutes before appointment when cancellation is allowed"));
            settingRepository.save(new OperationalSetting("AUTO_CALL_BUFFER", "3", "Number of waiting customers to alert in advance"));
            settingRepository.save(new OperationalSetting("MAX_DAILY_TOKENS_PER_USER", "5", "Maximum daily walk-in tokens per user"));
            settingRepository.save(new OperationalSetting("ORGANIZATION_NAME", "QueueLess Platform", "Primary Organization Title"));
        }

        // Initialize Organization
        Organization org;
        if (organizationRepository.count() == 0) {
            org = organizationRepository.save(new Organization(
                "QueueLess Platform - Tamil Nadu",
                "Digital Queue & Appointment Management Platform for Tamil Nadu Branches",
                "contact@queueless.com",
                "+91 44 2530 0000"
            ));
        } else {
            org = organizationRepository.findAll().get(0);
        }

        // Initialize Branches safely and idempotently
        Branch salemBranch = getOrCreateBranch(org.getId(), "Salem Main Branch", "SLM-01", "12, Five Roads, Salem, Tamil Nadu", "Salem", "+91 427 244 5500", "salem.main@queueless.com");
        Branch chennaiBranch = getOrCreateBranch(org.getId(), "Chennai Central Branch", "MAA-01", "25, Anna Salai, Chennai, Tamil Nadu", "Chennai", "+91 44 2852 1100", "chennai.central@queueless.com");
        Branch coimbatoreBranch = getOrCreateBranch(org.getId(), "Coimbatore Branch", "CJB-01", "18, Avinashi Road, Coimbatore, Tamil Nadu", "Coimbatore", "+91 422 230 4400", "coimbatore.office@queueless.com");

        // Initialize Services for each branch
        ServiceEntity salemAcc = getOrCreateService(salemBranch.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
        ServiceEntity salemCsh = getOrCreateService(salemBranch.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);
        ServiceEntity salemSup = getOrCreateService(salemBranch.getId(), "Customer Support", "SUP", "General customer support and assistance", 10);
        ServiceEntity salemLon = getOrCreateService(salemBranch.getId(), "Loan Enquiry", "LON", "Enquiry regarding available loan services", 20);

        ServiceEntity chennaiAcc = getOrCreateService(chennaiBranch.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
        ServiceEntity chennaiCsh = getOrCreateService(chennaiBranch.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);
        ServiceEntity chennaiSup = getOrCreateService(chennaiBranch.getId(), "Customer Support", "SUP", "General customer support and assistance", 10);
        ServiceEntity chennaiLon = getOrCreateService(chennaiBranch.getId(), "Loan Enquiry", "LON", "Enquiry regarding available loan services", 20);

        ServiceEntity cjbAcc = getOrCreateService(coimbatoreBranch.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
        ServiceEntity cjbCsh = getOrCreateService(coimbatoreBranch.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);
        ServiceEntity cjbSup = getOrCreateService(coimbatoreBranch.getId(), "Customer Support", "SUP", "General customer support and assistance", 10);
        ServiceEntity cjbLon = getOrCreateService(coimbatoreBranch.getId(), "Loan Enquiry", "LON", "Enquiry regarding available loan services", 20);

        // Initialize Counters for branches
        Counter salemC1 = getOrCreateCounter(salemBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter salemC2 = getOrCreateCounter(salemBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");
        Counter salemC3 = getOrCreateCounter(salemBranch.getId(), "Counter 3", 3, "Ground Floor, Window 3");

        Counter chennaiC1 = getOrCreateCounter(chennaiBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter chennaiC2 = getOrCreateCounter(chennaiBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");

        Counter cjbC1 = getOrCreateCounter(coimbatoreBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter cjbC2 = getOrCreateCounter(coimbatoreBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");

        // Seed Tamil Nadu Staff Accounts
        User karthik = getOrCreateStaffUser("Karthik Raj", "karthik@queueless.com", staffPass, "+91 98401 11001", salemBranch.getId(), salemC1.getId());
        User priya = getOrCreateStaffUser("Priya Devi", "priya@queueless.com", staffPass, "+91 98401 11002", salemBranch.getId(), salemC2.getId());
        User arun = getOrCreateStaffUser("Arun Kumar", "arun@queueless.com", staffPass, "+91 98401 11003", salemBranch.getId(), salemC3.getId());

        User suresh = getOrCreateStaffUser("Suresh Kumar", "suresh@queueless.com", staffPass, "+91 98402 11001", chennaiBranch.getId(), chennaiC1.getId());
        User divya = getOrCreateStaffUser("Divya Priya", "divya@queueless.com", staffPass, "+91 98402 11002", chennaiBranch.getId(), chennaiC2.getId());

        User naveen = getOrCreateStaffUser("Naveen Kumar", "naveen@queueless.com", staffPass, "+91 98403 11001", coimbatoreBranch.getId(), cjbC1.getId());
        User keerthana = getOrCreateStaffUser("Keerthana S", "keerthana@queueless.com", staffPass, "+91 98403 11002", coimbatoreBranch.getId(), cjbC2.getId());

        // Assign staff to counters in Counter model
        assignStaffToCounter(salemC1, karthik);
        assignStaffToCounter(salemC2, priya);
        assignStaffToCounter(salemC3, arun);
        assignStaffToCounter(chennaiC1, suresh);
        assignStaffToCounter(chennaiC2, divya);
        assignStaffToCounter(cjbC1, naveen);
        assignStaffToCounter(cjbC2, keerthana);

        // Seed Tamil Nadu Customer Demo Accounts
        User nirmal = getOrCreateCustomerUser("Nirmal Kumar", "nirmal@gmail.com", customerPass, "+91 99401 22001");
        User vignesh = getOrCreateCustomerUser("Vignesh Raj", "vignesh@gmail.com", customerPass, "+91 99401 22002");
        User harish = getOrCreateCustomerUser("Harish Kumar", "harish@gmail.com", customerPass, "+91 99401 22003");
        User monisha = getOrCreateCustomerUser("Monisha Devi", "monisha@gmail.com", customerPass, "+91 99401 22004");
        User anitha = getOrCreateCustomerUser("Anitha S", "anitha@gmail.com", customerPass, "+91 99401 22005");

        // Seed Sample Queue Tokens for Salem & Chennai (Dynamic for Today)
        if (queueTokenRepository.count() == 0) {
            // Token 1: WAITING
            QueueToken t1 = new QueueToken();
            t1.setTokenNumber("ACC-101");
            t1.setBranchId(salemBranch.getId());
            t1.setServiceId(salemAcc.getId());
            t1.setCustomerId(nirmal.getId());
            t1.setCustomerName(nirmal.getName());
            t1.setCustomerEmail(nirmal.getEmail());
            t1.setCustomerPhone(nirmal.getPhone());
            t1.setStatus(QueueStatus.WAITING);
            t1.setIssueTime(LocalDateTime.now().minusMinutes(25));
            t1.setEstimatedWaitMinutes(15);
            queueTokenRepository.save(t1);

            // Token 2: CALLED
            QueueToken t2 = new QueueToken();
            t2.setTokenNumber("CSH-102");
            t2.setBranchId(salemBranch.getId());
            t2.setServiceId(salemCsh.getId());
            t2.setCustomerId(vignesh.getId());
            t2.setCustomerName(vignesh.getName());
            t2.setCustomerEmail(vignesh.getEmail());
            t2.setCustomerPhone(vignesh.getPhone());
            t2.setCounterId(salemC1.getId());
            t2.setCounterName(salemC1.getName());
            t2.setStaffId(karthik.getId());
            t2.setStaffName(karthik.getName());
            t2.setStatus(QueueStatus.CALLED);
            t2.setIssueTime(LocalDateTime.now().minusMinutes(20));
            t2.setCalledTime(LocalDateTime.now().minusMinutes(2));
            t2.setEstimatedWaitMinutes(0);
            queueTokenRepository.save(t2);

            // Token 3: IN_SERVICE
            QueueToken t3 = new QueueToken();
            t3.setTokenNumber("SUP-103");
            t3.setBranchId(salemBranch.getId());
            t3.setServiceId(salemSup.getId());
            t3.setCustomerId(harish.getId());
            t3.setCustomerName(harish.getName());
            t3.setCustomerEmail(harish.getEmail());
            t3.setCustomerPhone(harish.getPhone());
            t3.setCounterId(salemC2.getId());
            t3.setCounterName(salemC2.getName());
            t3.setStaffId(priya.getId());
            t3.setStaffName(priya.getName());
            t3.setStatus(QueueStatus.IN_SERVICE);
            t3.setIssueTime(LocalDateTime.now().minusMinutes(30));
            t3.setCalledTime(LocalDateTime.now().minusMinutes(10));
            t3.setServiceStartTime(LocalDateTime.now().minusMinutes(8));
            t3.setEstimatedWaitMinutes(0);
            queueTokenRepository.save(t3);

            // Token 4: COMPLETED
            QueueToken t4 = new QueueToken();
            t4.setTokenNumber("LON-104");
            t4.setBranchId(salemBranch.getId());
            t4.setServiceId(salemLon.getId());
            t4.setCustomerId(monisha.getId());
            t4.setCustomerName(monisha.getName());
            t4.setCustomerEmail(monisha.getEmail());
            t4.setCustomerPhone(monisha.getPhone());
            t4.setCounterId(salemC3.getId());
            t4.setCounterName(salemC3.getName());
            t4.setStaffId(arun.getId());
            t4.setStaffName(arun.getName());
            t4.setStatus(QueueStatus.COMPLETED);
            t4.setIssueTime(LocalDateTime.now().minusMinutes(45));
            t4.setCalledTime(LocalDateTime.now().minusMinutes(25));
            t4.setServiceStartTime(LocalDateTime.now().minusMinutes(23));
            t4.setServiceEndTime(LocalDateTime.now().minusMinutes(5));
            t4.setNotes("Loan enquiry resolved successfully");
            queueTokenRepository.save(t4);

            // Token 5: SKIPPED
            QueueToken t5 = new QueueToken();
            t5.setTokenNumber("ACC-105");
            t5.setBranchId(salemBranch.getId());
            t5.setServiceId(salemAcc.getId());
            t5.setCustomerId(anitha.getId());
            t5.setCustomerName(anitha.getName());
            t5.setCustomerEmail(anitha.getEmail());
            t5.setCustomerPhone(anitha.getPhone());
            t5.setStatus(QueueStatus.SKIPPED);
            t5.setIssueTime(LocalDateTime.now().minusMinutes(50));
            t5.setCalledTime(LocalDateTime.now().minusMinutes(35));
            t5.setNotes("Customer did not respond when called");
            queueTokenRepository.save(t5);

            // Token 6: Chennai WAITING
            QueueToken t6 = new QueueToken();
            t6.setTokenNumber("ACC-201");
            t6.setBranchId(chennaiBranch.getId());
            t6.setServiceId(chennaiAcc.getId());
            t6.setCustomerId(nirmal.getId());
            t6.setCustomerName(nirmal.getName());
            t6.setCustomerEmail(nirmal.getEmail());
            t6.setCustomerPhone(nirmal.getPhone());
            t6.setStatus(QueueStatus.WAITING);
            t6.setIssueTime(LocalDateTime.now().minusMinutes(10));
            t6.setEstimatedWaitMinutes(10);
            queueTokenRepository.save(t6);
        }

        // Seed Sample Appointments (Dynamic for Today)
        if (appointmentRepository.count() == 0) {
            Appointment a1 = new Appointment();
            a1.setReferenceCode("APT-SLM-101");
            a1.setCustomerId(nirmal.getId());
            a1.setCustomerName(nirmal.getName());
            a1.setCustomerEmail(nirmal.getEmail());
            a1.setCustomerPhone(nirmal.getPhone());
            a1.setBranchId(salemBranch.getId());
            a1.setServiceId(salemAcc.getId());
            a1.setAppointmentDate(LocalDate.now());
            a1.setAppointmentTime(LocalTime.of(10, 30));
            a1.setStatus(AppointmentStatus.CONFIRMED);
            appointmentRepository.save(a1);

            Appointment a2 = new Appointment();
            a2.setReferenceCode("APT-MAA-102");
            a2.setCustomerId(vignesh.getId());
            a2.setCustomerName(vignesh.getName());
            a2.setCustomerEmail(vignesh.getEmail());
            a2.setCustomerPhone(vignesh.getPhone());
            a2.setBranchId(chennaiBranch.getId());
            a2.setServiceId(chennaiCsh.getId());
            a2.setAppointmentDate(LocalDate.now());
            a2.setAppointmentTime(LocalTime.of(11, 00));
            a2.setStatus(AppointmentStatus.CHECKED_IN);
            appointmentRepository.save(a2);
        }
    }

    private Branch getOrCreateBranch(Long orgId, String name, String code, String address, String city, String phone, String email) {
        return branchRepository.findAll().stream()
                .filter(b -> b.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> branchRepository.save(new Branch(orgId, name, code, address, city, phone, email)));
    }

    private ServiceEntity getOrCreateService(Long branchId, String name, String code, String description, int duration) {
        return serviceRepository.findByBranchId(branchId).stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(branchId, name, code, description, duration)));
    }

    private Counter getOrCreateCounter(Long branchId, String name, int number, String location) {
        return counterRepository.findByBranchId(branchId).stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Counter counter = new Counter(branchId, name, number, location);
                    counter.setStatus("OPEN");
                    return counterRepository.save(counter);
                });
    }

    private User getOrCreateStaffUser(String name, String email, String password, String phone, Long branchId, Long counterId) {
        return userRepository.findByEmail(email).map(user -> {
            user.setAssignedBranchId(branchId);
            user.setAssignedCounterId(counterId);
            return userRepository.save(user);
        }).orElseGet(() -> {
            User staff = new User(name, email, passwordEncoder.encode(password), phone, Role.STAFF);
            staff.setAssignedBranchId(branchId);
            staff.setAssignedCounterId(counterId);
            return userRepository.save(staff);
        });
    }

    private User getOrCreateCustomerUser(String name, String email, String password, String phone) {
        return userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(new User(name, email, passwordEncoder.encode(password), phone, Role.CUSTOMER))
        );
    }

    private void assignStaffToCounter(Counter counter, User staff) {
        if (counter != null && staff != null) {
            counter.setAssignedStaffId(staff.getId());
            counter.setStatus("OPEN");
            counterRepository.save(counter);
        }
    }
}
