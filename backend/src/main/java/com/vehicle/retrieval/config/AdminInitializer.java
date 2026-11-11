package com.vehicle.retrieval.config;

import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.Role;
import com.vehicle.retrieval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:${ADMIN_EMAIL:admin@vrdms.com}}")
    private String adminEmail;

    @Value("${app.admin.password:${ADMIN_PASSWORD:}}")
    private String adminPassword;

    @Value("${app.admin.name:${ADMIN_NAME:System Administrator}}")
    private String adminName;

    @Value("${app.admin.phone:${ADMIN_PHONE:+910000000000}}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        // Idempotent check: Never overwrite or re-create if an ADMIN already exists or email is taken
        if (Boolean.TRUE.equals(userRepository.existsByRole(Role.ADMIN)) || Boolean.TRUE.equals(userRepository.existsByEmail(adminEmail))) {
            log.info("Admin account already present in database. Skipping initialization.");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("No administrator account found in database and ADMIN_PASSWORD environment variable is not set. " +
                    "To bootstrap an initial administrator on a fresh production database, provide ADMIN_PASSWORD.");
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .phone(adminPhone)
                .password(passwordEncoder.encode(adminPassword.trim()))
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(admin);
        log.info("Successfully bootstrapped initial Administrator account: {}", adminEmail);
    }
}

