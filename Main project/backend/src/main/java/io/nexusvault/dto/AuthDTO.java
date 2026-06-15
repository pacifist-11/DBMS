package io.nexusvault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 50)
        private String username;

        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 8)
        private String password;

        // Optional: if not provided, defaults to USER
        private String role;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String email;
        private String role;
        private String message;

        public AuthResponse(String token, String username, String email, String role) {
            this.token    = token;
            this.username = username;
            this.email    = email;
            this.role     = role;
            this.message  = "Authentication successful";
        }
    }
}
