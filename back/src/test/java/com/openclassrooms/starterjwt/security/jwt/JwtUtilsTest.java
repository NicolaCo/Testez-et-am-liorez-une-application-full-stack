package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtUtilsTest {

    private static final String SECRET = "A".repeat(88);
    private static final int EXPIRATION_MS = 3600000;

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", EXPIRATION_MS);
    }

    private Authentication authentication() {
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username("user@test.com")
                .firstName("Alex")
                .lastName("Bernard")
                .password("encoded")
                .build();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        return authentication;
    }

    @Test
    void generateJwtToken_returnsNonBlankToken() {
        String token = jwtUtils.generateJwtToken(authentication());

        assertThat(token).isNotBlank();
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("user@test.com");
    }

    @Test
    void validateJwtToken_withValidToken_returnsTrue() {
        String token = jwtUtils.generateJwtToken(authentication());

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    void validateJwtToken_withInvalidSignature_returnsFalse() {
        String token = jwtUtils.generateJwtToken(authentication());

        JwtUtils otherJwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(otherJwtUtils, "jwtSecret", "B".repeat(88));
        ReflectionTestUtils.setField(otherJwtUtils, "jwtExpirationMs", EXPIRATION_MS);

        assertThat(otherJwtUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    void validateJwtToken_withMalformedToken_returnsFalse() {
        String validToken = jwtUtils.generateJwtToken(authentication());
        String malformed = validToken.substring(0, validToken.length() - 4) + "oooo";

        assertThat(jwtUtils.validateJwtToken(malformed)).isFalse();
    }

    @Test
    void validateJwtToken_withExpiredToken_returnsFalse() {
        JwtUtils expiredUtils = new JwtUtils();
        ReflectionTestUtils.setField(expiredUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(expiredUtils, "jwtExpirationMs", -1000);

        String token = expiredUtils.generateJwtToken(authentication());

        assertThat(expiredUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    void validateJwtToken_withNullToken_returnsFalse() {
        assertThat(jwtUtils.validateJwtToken(null)).isFalse();
    }

    @Test
    void validateJwtToken_withEmptyToken_returnsFalse() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    @Test
    void validateJwtToken_withUnsupportedAlgorithm_returnsFalse() {
        String header = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"sub\":\"user@test.com\"}".getBytes(StandardCharsets.UTF_8));
        String token = header + "." + payload + ".";

        assertThat(jwtUtils.validateJwtToken(token)).isFalse();
    }
}