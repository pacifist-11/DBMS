package io.nexusvault;

import io.nexusvault.entity.UserEntity;
import io.nexusvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer — seeds default users into the database on startup.
 *
 * Runs once after the application context is ready. Skips insertion
 * if the user already exists (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin",     "admin@nexusvault.io",     "Admin@123",  UserEntity.Role.ADMIN);
        seedUser("warehouse", "warehouse@nexusvault.io", "Admin@123",  UserEntity.Role.USER);
    }

    private void seedUser(String username, String email, String rawPassword, UserEntity.Role role) {
        if (userRepository.existsByEmail(email)) {
            log.info("DataInitializer: user '{}' already exists — skipping.", email);
            return;
        }
        UserEntity user = UserEntity.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .isActive(true)
                .build();
        userRepository.save(user);
        log.info("DataInitializer: created {} user '{}'.", role, email);
    }
}
