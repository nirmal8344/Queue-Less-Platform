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
            settingRepository.save(new OperationalSetting("ORGANIZATION_NAME", "QueueLess Platform", "Primary Organization Title"));
        }
    }
}
