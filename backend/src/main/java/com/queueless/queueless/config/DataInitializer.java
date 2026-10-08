package com.queueless.queueless.config;

import com.queueless.queueless.model.*;
import com.queueless.queueless.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
                           PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.serviceRepository = serviceRepository;
        this.counterRepository = counterRepository;
        this.counterServiceRepository = counterServiceRepository;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed initial Admin Account only if SEED_ADMIN_PASSWORD is set and account does not exist
        if (seedAdminPassword != null && !seedAdminPassword.trim().isEmpty()) {
            if (userRepository.findByEmail("admin@queueless.com").isEmpty()) {
                User admin = new User("System Admin", "admin@queueless.com",
                        passwordEncoder.encode(seedAdminPassword), "+1 (555) 000-0001", Role.ADMIN);
                userRepository.save(admin);
            }
        }

        // Seed initial Staff Account only if SEED_STAFF_PASSWORD is set and account does not exist
        if (seedStaffPassword != null && !seedStaffPassword.trim().isEmpty()) {
            if (userRepository.findByEmail("staff@queueless.com").isEmpty()) {
                User staff = new User("Primary Staff", "staff@queueless.com",
                        passwordEncoder.encode(seedStaffPassword), "+1 (555) 000-0002", Role.STAFF);
                userRepository.save(staff);
            }
        }

        // Initialize Operational Settings if missing
        if (settingRepository.count() == 0) {
            settingRepository.save(new OperationalSetting("CANCELLATION_MINUTES_BEFORE", "60", "Minutes before appointment when cancellation is allowed"));
            settingRepository.save(new OperationalSetting("AUTO_CALL_BUFFER", "3", "Number of waiting customers to alert in advance"));
            settingRepository.save(new OperationalSetting("MAX_DAILY_TOKENS_PER_USER", "5", "Maximum daily walk-in tokens per user"));
            settingRepository.save(new OperationalSetting("ORGANIZATION_NAME", "Tamil Nadu Public Services Queue Platform", "Primary Organization Title"));
        }

        // Initialize Tamil Nadu default organization, branches, services and counters if missing
        if (organizationRepository.count() == 0) {
            Organization org = organizationRepository.save(new Organization(
                "Tamil Nadu Public Services & Queue Platform",
                "Official Queue & Appointment Management Platform for Tamil Nadu Branches",
                "contact@tnservices.gov.in",
                "+91 44 2530 0000"
            ));

            Branch chennai = branchRepository.save(new Branch(
                org.getId(), "Chennai Central Branch", "MAA-01",
                "Anna Salai, Near LIC Building", "Chennai",
                "+91 44 2852 1100", "chennai.central@tnservices.gov.in"
            ));

            Branch coimbatore = branchRepository.save(new Branch(
                org.getId(), "Coimbatore Regional Office", "CJB-01",
                "Avinashi Road, Near Collectorate", "Coimbatore",
                "+91 422 230 4400", "coimbatore.office@tnservices.gov.in"
            ));

            Branch madurai = branchRepository.save(new Branch(
                org.getId(), "Madurai District Hub", "IXM-01",
                "KK Nagar Main Road", "Madurai",
                "+91 452 253 2200", "madurai.hub@tnservices.gov.in"
            ));

            Branch trichy = branchRepository.save(new Branch(
                org.getId(), "Tiruchirappalli City Center", "TRZ-01",
                "Cantonment, Near Central Bus Stand", "Tiruchirappalli",
                "+91 431 241 3300", "trichy.center@tnservices.gov.in"
            ));

            // Seed Services for Chennai Central Branch
            serviceRepository.save(new ServiceEntity(chennai.getId(), "e-Sevai & Certificate Services", "TCS", "Patta, Chitta, Birth/Death Certificates & Community Documents", 15));
            serviceRepository.save(new ServiceEntity(chennai.getId(), "Revenue & Land Administration", "RLA", "Property registration, encumbrance certificates & land revenue", 20));
            serviceRepository.save(new ServiceEntity(chennai.getId(), "Transport & Driving Licensing", "TDL", "Learner license, driving license renewal & vehicle registration", 15));
            serviceRepository.save(new ServiceEntity(chennai.getId(), "Utility & Public Grievances", "UPG", "Electricity bill, water connection & public grievance registration", 10));

            // Seed Services for Coimbatore Branch
            serviceRepository.save(new ServiceEntity(coimbatore.getId(), "e-Sevai & Certificate Services", "TCS", "Patta, Chitta, Birth/Death Certificates & Community Documents", 15));
            serviceRepository.save(new ServiceEntity(coimbatore.getId(), "Revenue & Land Administration", "RLA", "Property registration, encumbrance certificates & land revenue", 20));
            serviceRepository.save(new ServiceEntity(coimbatore.getId(), "Transport & Driving Licensing", "TDL", "Learner license, driving license renewal & vehicle registration", 15));

            // Seed Services for Madurai Branch
            serviceRepository.save(new ServiceEntity(madurai.getId(), "e-Sevai & Certificate Services", "TCS", "Patta, Chitta, Birth/Death Certificates & Community Documents", 15));
            serviceRepository.save(new ServiceEntity(madurai.getId(), "Revenue & Land Administration", "RLA", "Property registration, encumbrance certificates & land revenue", 20));

            // Seed Services for Trichy Branch
            serviceRepository.save(new ServiceEntity(trichy.getId(), "e-Sevai & Certificate Services", "TCS", "Patta, Chitta, Birth/Death Certificates & Community Documents", 15));
            serviceRepository.save(new ServiceEntity(trichy.getId(), "Utility & Public Grievances", "UPG", "Electricity bill, water connection & public grievance registration", 10));

            // Seed Counters for Chennai Branch
            Counter c1 = new Counter(chennai.getId(), "Counter 1 - General Help Desk", 1, "Ground Floor, Window A");
            c1.setStatus("OPEN");
            counterRepository.save(c1);

            Counter c2 = new Counter(chennai.getId(), "Counter 2 - Document Verification", 2, "Ground Floor, Window B");
            c2.setStatus("OPEN");
            counterRepository.save(c2);

            Counter c3 = new Counter(chennai.getId(), "Counter 3 - Senior Citizens & Special Care", 3, "Priority Desk, Window C");
            c3.setStatus("OPEN");
            counterRepository.save(c3);
        }
    }
}
