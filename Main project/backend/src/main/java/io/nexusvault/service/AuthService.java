package io.nexusvault.service;

import io.nexusvault.dto.AuthDTO;
import io.nexusvault.entity.UserEntity;
import io.nexusvault.repository.UserRepository;
import io.nexusvault.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ── Login ─────────────────────────────────────────────────────────────

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        // Throws BadCredentialsException if wrong
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user);
        return new AuthDTO.AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    // ── Register ──────────────────────────────────────────────────────────

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }

        // Determine role — only allow USER registration publicly; ADMIN set manually
        UserEntity.Role role = UserEntity.Role.USER;
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            role = UserEntity.Role.ADMIN;
        }

        UserEntity user = UserEntity.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(role)
            .isActive(true)
            .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthDTO.AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
