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
        String adminPass = (seedAdminPassword != null && !seedAdminPassword.trim().isEmpty()) ? seedAdminPassword : "QueueLess@Admin2026!";
        String staffPass = (seedStaffPassword != null && !seedStaffPassword.trim().isEmpty()) ? seedStaffPassword : "StaffPass@123";
        String customerPass = "customer123";

        // Force update workingDays for ALL existing branches in PostgreSQL
        branchRepository.findAll().forEach(b -> {
            b.setWorkingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY");
            branchRepository.save(b);
        });

        // Seed / Update Admin Account safely & idempotently
        userRepository.findByEmail("admin@queueless.com").ifPresentOrElse(
            admin -> {
                admin.setRole(Role.ADMIN);
                admin.setPassword(passwordEncoder.encode(adminPass));
                userRepository.save(admin);
            },
            () -> {
                User admin = new User("System Admin", "admin@queueless.com",
                        passwordEncoder.encode(adminPass), "+91 98400 00001", Role.ADMIN);
                userRepository.save(admin);
            }
        );

        // Seed / Update Primary Staff Account safely
        userRepository.findByEmail("staff@queueless.com").ifPresentOrElse(
            staff -> {
                staff.setRole(Role.STAFF);
                staff.setPassword(passwordEncoder.encode(staffPass));
                userRepository.save(staff);
            },
            () -> {
                User staff = new User("Primary Staff", "staff@queueless.com",
                        passwordEncoder.encode(staffPass), "+91 98400 00002", Role.STAFF);
                userRepository.save(staff);
            }
        );

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
        Branch maduraiBranch = getOrCreateBranch(org.getId(), "Madurai Branch", "MDU-01", "45, KK Nagar Main Road, Madurai, Tamil Nadu", "Madurai", "+91 452 253 2200", "madurai.hub@queueless.com");
        Branch trichyBranch = getOrCreateBranch(org.getId(), "Tiruchirappalli Branch", "TRY-01", "10, Cantonment, Tiruchirappalli, Tamil Nadu", "Tiruchirappalli", "+91 431 241 3300", "trichy.center@queueless.com");
        Branch erodeBranch = getOrCreateBranch(org.getId(), "Erode Branch", "ERD-01", "88, Brough Road, Erode, Tamil Nadu", "Erode", "+91 424 222 1100", "erode.office@queueless.com");
        Branch tirunelveliBranch = getOrCreateBranch(org.getId(), "Tirunelveli Branch", "TNV-01", "34, High Ground Road, Tirunelveli, Tamil Nadu", "Tirunelveli", "+91 462 250 4400", "tirunelveli.main@queueless.com");

        List<Branch> allBranches = List.of(salemBranch, chennaiBranch, coimbatoreBranch, maduraiBranch, trichyBranch, erodeBranch, tirunelveliBranch);

        // Initialize Standard Services for each branch
        for (Branch b : allBranches) {
            getOrCreateService(b.getId(), "e-Sevai and Certificate Services", "ESV", "Government e-Sevai certificates and documentation", 15);
            getOrCreateService(b.getId(), "Revenue and Land Administration", "REV", "Pattah, land revenue, and property records", 20);
            getOrCreateService(b.getId(), "Transport and Driving Licence Services", "TRN", "RTO services, driving licences, and vehicle registration", 20);
            getOrCreateService(b.getId(), "Utility and Public Grievances", "UTL", "Public grievances and utility bill payments", 15);
            getOrCreateService(b.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
            getOrCreateService(b.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);
            getOrCreateService(b.getId(), "Customer Support", "SUP", "General customer support and assistance", 10);
            getOrCreateService(b.getId(), "Loan Enquiry", "LON", "Enquiry regarding available loan services", 20);
        }

        // Initialize Services references for primary branches
        ServiceEntity salemAcc = getOrCreateService(salemBranch.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
        ServiceEntity salemCsh = getOrCreateService(salemBranch.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);
        ServiceEntity salemSup = getOrCreateService(salemBranch.getId(), "Customer Support", "SUP", "General customer support and assistance", 10);
        ServiceEntity salemLon = getOrCreateService(salemBranch.getId(), "Loan Enquiry", "LON", "Enquiry regarding available loan services", 20);

        ServiceEntity chennaiAcc = getOrCreateService(chennaiBranch.getId(), "Account Opening", "ACC", "Open and manage customer accounts", 15);
        ServiceEntity chennaiCsh = getOrCreateService(chennaiBranch.getId(), "Cash Deposit", "CSH", "Deposit cash at the service counter", 10);

        // Initialize Counters for branches
        Counter salemC1 = getOrCreateCounter(salemBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter salemC2 = getOrCreateCounter(salemBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");
        Counter salemC3 = getOrCreateCounter(salemBranch.getId(), "Counter 3", 3, "Ground Floor, Window 3");

        Counter chennaiC1 = getOrCreateCounter(chennaiBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter chennaiC2 = getOrCreateCounter(chennaiBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");

        Counter cjbC1 = getOrCreateCounter(coimbatoreBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter cjbC2 = getOrCreateCounter(coimbatoreBranch.getId(), "Counter 2", 2, "Ground Floor, Window 2");

        Counter mduC1 = getOrCreateCounter(maduraiBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");
        Counter tryC1 = getOrCreateCounter(trichyBranch.getId(), "Counter 1", 1, "Ground Floor, Window 1");

        // Seed Tamil Nadu Staff Accounts
        User karthik = getOrCreateStaffUser("Karthik Raj", "karthik@queueless.com", staffPass, "+91 98401 11001", salemBranch.getId(), salemC1.getId());
        User priya = getOrCreateStaffUser("Priya Devi", "priya@queueless.com", staffPass, "+91 98401 11002", salemBranch.getId(), salemC2.getId());
        User arun = getOrCreateStaffUser("Arun Kumar", "arun@queueless.com", staffPass, "+91 98401 11003", salemBranch.getId(), salemC3.getId());

        User suresh = getOrCreateStaffUser("Suresh Kumar", "suresh@queueless.com", staffPass, "+91 98402 11001", chennaiBranch.getId(), chennaiC1.getId());
        User divya = getOrCreateStaffUser("Divya Priya", "divya@queueless.com", staffPass, "+91 98402 11002", chennaiBranch.getId(), chennaiC2.getId());

        User naveen = getOrCreateStaffUser("Naveen Kumar", "naveen@queueless.com", staffPass, "+91 98403 11001", coimbatoreBranch.getId(), cjbC1.getId());
        User keerthana = getOrCreateStaffUser("Keerthana S", "keerthana@queueless.com", staffPass, "+91 98403 11002", maduraiBranch.getId(), mduC1.getId());
        User meena = getOrCreateStaffUser("Meena Lakshmi", "meena@queueless.com", staffPass, "+91 98404 11001", trichyBranch.getId(), tryC1.getId());

        // Assign staff to counters in Counter model
        assignStaffToCounter(salemC1, karthik);
        assignStaffToCounter(salemC2, priya);
        assignStaffToCounter(salemC3, arun);
        assignStaffToCounter(chennaiC1, suresh);
        assignStaffToCounter(chennaiC2, divya);
        assignStaffToCounter(cjbC1, naveen);
        assignStaffToCounter(mduC1, keerthana);
        assignStaffToCounter(tryC1, meena);

        // Seed Tamil Nadu Customer Demo Accounts
        User nirmal = getOrCreateCustomerUser("Nirmal Kumar", "nirmal@gmail.com", customerPass, "+91 99401 22001");
        User vignesh = getOrCreateCustomerUser("Vignesh Raj", "vignesh@gmail.com", customerPass, "+91 99401 22002");
        User harish = getOrCreateCustomerUser("Harish Kumar", "harish@gmail.com", customerPass, "+91 99401 22003");
        User monisha = getOrCreateCustomerUser("Monisha Devi", "monisha@gmail.com", customerPass, "+91 99401 22004");
        User anitha = getOrCreateCustomerUser("Anitha S", "anitha@gmail.com", customerPass, "+91 99401 22005");
        User kavin = getOrCreateCustomerUser("Kavin Raj", "kavin@gmail.com", customerPass, "+91 99401 22006");
        User priyalakshmi = getOrCreateCustomerUser("Priya Lakshmi", "priyalakshmi@gmail.com", customerPass, "+91 99401 22007");
        User saranya = getOrCreateCustomerUser("Saranya Devi", "saranya@gmail.com", customerPass, "+91 99401 22008");
        User arunprakash = getOrCreateCustomerUser("Arun Prakash", "arunprakash@gmail.com", customerPass, "+91 99401 22009");
        User divyapriya = getOrCreateCustomerUser("Divya Priya", "divyapriya@gmail.com", customerPass, "+91 99401 22010");

        // Ensure all branches have SATURDAY included in workingDays
        for (Branch b : allBranches) {
            if (b.getWorkingDays() == null || !b.getWorkingDays().contains("SATURDAY")) {
                b.setWorkingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY");
                branchRepository.save(b);
            }
        }

        // Seed Sample Queue Tokens for ALL branches with ALL statuses dynamically
        for (Branch b : allBranches) {
            List<ServiceEntity> bServices = serviceRepository.findByBranchId(b.getId());
            List<Counter> bCounters = counterRepository.findByBranchId(b.getId());
            if (bServices.isEmpty()) continue;

            ServiceEntity s1 = bServices.get(0);
            ServiceEntity s2 = bServices.size() > 1 ? bServices.get(1) : s1;
            ServiceEntity s3 = bServices.size() > 2 ? bServices.get(2) : s1;

            Counter c1 = !bCounters.isEmpty() ? bCounters.get(0) : null;
            Counter c2 = bCounters.size() > 1 ? bCounters.get(1) : c1;

            // Ensure Active Serving Token (CALLED or IN_SERVICE) exists for Live TV Display
            if (queueTokenRepository.findActiveServingTokensForBranch(b.getId()).isEmpty()) {
                QueueToken tokInServ = new QueueToken();
                tokInServ.setTokenNumber(s2.getCode() + "-102");
                tokInServ.setBranchId(b.getId());
                tokInServ.setServiceId(s2.getId());
                tokInServ.setCustomerId(vignesh.getId());
                tokInServ.setCustomerName(vignesh.getName());
                tokInServ.setCustomerEmail(vignesh.getEmail());
                tokInServ.setCustomerPhone(vignesh.getPhone());
                if (c1 != null) {
                    tokInServ.setCounterId(c1.getId());
                    tokInServ.setCounterName(c1.getName());
                }
                tokInServ.setStatus(QueueStatus.IN_SERVICE);
                tokInServ.setIssueTime(LocalDateTime.now().minusMinutes(25));
                tokInServ.setCalledTime(LocalDateTime.now().minusMinutes(10));
                tokInServ.setServiceStartTime(LocalDateTime.now().minusMinutes(8));
                tokInServ.setEstimatedWaitMinutes(0);
                queueTokenRepository.save(tokInServ);
            }

            // Ensure Recently Completed Token exists for Live TV Display
            if (queueTokenRepository.findRecentCompletedForBranch(b.getId()).isEmpty()) {
                QueueToken tokComp = new QueueToken();
                tokComp.setTokenNumber(s1.getCode() + "-104");
                tokComp.setBranchId(b.getId());
                tokComp.setServiceId(s1.getId());
                tokComp.setCustomerId(monisha.getId());
                tokComp.setCustomerName(monisha.getName());
                tokComp.setCustomerEmail(monisha.getEmail());
                tokComp.setCustomerPhone(monisha.getPhone());
                if (c1 != null) {
                    tokComp.setCounterId(c1.getId());
                    tokComp.setCounterName(c1.getName());
                }
                tokComp.setStatus(QueueStatus.COMPLETED);
                tokComp.setIssueTime(LocalDateTime.now().minusMinutes(50));
                tokComp.setCalledTime(LocalDateTime.now().minusMinutes(35));
                tokComp.setServiceStartTime(LocalDateTime.now().minusMinutes(33));
                tokComp.setServiceEndTime(LocalDateTime.now().minusMinutes(15));
                tokComp.setActualServiceTimeMinutes(18);
                tokComp.setNotes("Service completed successfully");
                queueTokenRepository.save(tokComp);
            }

            // Ensure Waiting Token exists
            if (queueTokenRepository.findWaitingTokensForBranch(b.getId()).isEmpty()) {
                QueueToken tokWaiting = new QueueToken();
                tokWaiting.setTokenNumber(s1.getCode() + "-101");
                tokWaiting.setBranchId(b.getId());
                tokWaiting.setServiceId(s1.getId());
                tokWaiting.setCustomerId(nirmal.getId());
                tokWaiting.setCustomerName(nirmal.getName());
                tokWaiting.setCustomerEmail(nirmal.getEmail());
                tokWaiting.setCustomerPhone(nirmal.getPhone());
                tokWaiting.setStatus(QueueStatus.WAITING);
                tokWaiting.setIssueTime(LocalDateTime.now().minusMinutes(20));
                tokWaiting.setEstimatedWaitMinutes(15);
                queueTokenRepository.save(tokWaiting);
            }
        }

        // Seed Sample Appointments (Dynamic for Today and Future)
        if (appointmentRepository.count() == 0) {
            Appointment a1 = new Appointment();
            a1.setReferenceCode("APT-SLM-101");
            a1.setCustomerId(nirmal.getId());
            a1.setCustomerName(nirmal.getName());
            a1.setCustomerEmail(nirmal.getEmail());
            a1.setCustomerPhone(nirmal.getPhone());
            a1.setBranchId(salemBranch.getId());
            a1.setServiceId(salemAcc.getId());
            a1.setAppointmentDate(LocalDate.now().plusDays(1));
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
            a2.setAppointmentDate(LocalDate.now().plusDays(2));
            a2.setAppointmentTime(LocalTime.of(11, 00));
            a2.setStatus(AppointmentStatus.CONFIRMED);
            appointmentRepository.save(a2);

            Appointment a3 = new Appointment();
            a3.setReferenceCode("APT-CJB-103");
            a3.setCustomerId(harish.getId());
            a3.setCustomerName(harish.getName());
            a3.setCustomerEmail(harish.getEmail());
            a3.setCustomerPhone(harish.getPhone());
            a3.setBranchId(coimbatoreBranch.getId());
            a3.setServiceId(salemSup.getId());
            a3.setAppointmentDate(LocalDate.now().minusDays(1));
            a3.setAppointmentTime(LocalTime.of(14, 00));
            a3.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(a3);
        }
    }

    private Branch getOrCreateBranch(Long orgId, String name, String code, String address, String city, String phone, String email) {
        Branch b = branchRepository.findAll().stream()
                .filter(br -> br.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> branchRepository.save(new Branch(orgId, name, code, address, city, phone, email)));
        b.setWorkingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY");
        return branchRepository.save(b);
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
            user.setRole(Role.STAFF);
            user.setPassword(passwordEncoder.encode(password));
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
        return userRepository.findByEmail(email).map(user -> {
            user.setRole(Role.CUSTOMER);
            user.setPassword(passwordEncoder.encode(password));
            return userRepository.save(user);
        }).orElseGet(() ->
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
