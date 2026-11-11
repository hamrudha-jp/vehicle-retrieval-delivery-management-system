package com.vehicle.retrieval;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.Role;
import com.vehicle.retrieval.exception.GlobalExceptionHandler;
import com.vehicle.retrieval.repository.UserRepository;
import com.vehicle.retrieval.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ProductionReadinessTests {

    @Autowired
    private GlobalExceptionHandler exceptionHandler;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("1. BadCredentialsException must return HTTP 401 with 'Invalid email or password'")
    void testBadCredentialsExceptionHandler() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");
        ResponseEntity<ApiResponse<Object>> response = exceptionHandler.handleBadCredentialsException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().getSuccess());
        assertEquals("Invalid email or password", response.getBody().getMessage());
    }

    @Test
    @DisplayName("2. UserRepository existsByRole must accurately detect existing role")
    void testExistsByRole() {
        boolean hasAdminInitially = userRepository.existsByRole(Role.ADMIN);
        assertFalse(hasAdminInitially, "Test H2 database starts fresh with no admin");
    }

    @Test
    @DisplayName("3. JwtTokenProvider must reject default development secret when prod profile is active")
    void testJwtSecretValidationInProd() {
        JwtTokenProvider provider = new JwtTokenProvider();
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        ReflectionTestUtils.setField(provider, "environment", prodEnv);
        ReflectionTestUtils.setField(provider, "jwtSecret", JwtTokenProvider.DEFAULT_DEV_SECRET);

        IllegalStateException ex = assertThrows(IllegalStateException.class, provider::validateJwtSecretConfiguration);
        assertTrue(ex.getMessage().contains("In production mode, a unique, non-default JWT_SECRET environment variable is strictly required"));
    }

    @Test
    @DisplayName("4. JwtTokenProvider must reject secret shorter than 32 characters")
    void testJwtSecretLengthValidation() {
        JwtTokenProvider provider = new JwtTokenProvider();
        MockEnvironment devEnv = new MockEnvironment();

        ReflectionTestUtils.setField(provider, "environment", devEnv);
        ReflectionTestUtils.setField(provider, "jwtSecret", "short_secret_less_than_32");

        IllegalStateException ex = assertThrows(IllegalStateException.class, provider::validateJwtSecretConfiguration);
        assertTrue(ex.getMessage().contains("must be at least 32 characters"));
    }
}
