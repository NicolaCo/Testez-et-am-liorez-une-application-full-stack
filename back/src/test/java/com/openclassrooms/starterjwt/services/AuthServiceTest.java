package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.AuthService;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    public static final long ID = 1L;
    public static final String ADMIN_MAIL = "admin@studio.com";

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserService userService;

    private AuthService authService;

    private UserDetailsImpl userDetails;
    private User adminUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, jwtUtils, passwordEncoder, userService);

        userDetails = UserDetailsImpl.builder()
                .id(ID)
                .username(ADMIN_MAIL)
                .firstName("Admin")
                .lastName("Admin")
                .password("encoded")
                .build();

        adminUser = TestFixtures.user(ID, ADMIN_MAIL, true);
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    @Test
    void login_whenCredentialsValid_returnsJwtResponse() {
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        when(userService.findByEmail(ADMIN_MAIL)).thenReturn(Optional.of(adminUser));

        JwtResponse response = authService.login(loginRequest(ADMIN_MAIL, "test!1234"));

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getId()).isEqualTo(ID);
        assertThat(response.getUsername()).isEqualTo(ADMIN_MAIL);
        assertThat(response.getFirstName()).isEqualTo("Admin");
        assertThat(response.getLastName()).isEqualTo("Admin");
        assertThat(response.getAdmin()).isTrue();
    }

    @Test
    void login_whenUserMissing_setsAdminFalse() {
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        when(userService.findByEmail(ADMIN_MAIL)).thenReturn(Optional.empty());

        JwtResponse response = authService.login(loginRequest(ADMIN_MAIL, "test!1234"));

        assertThat(response.getAdmin()).isFalse();
    }

    @Test
    void login_whenCredentialsInvalid_throwsAuthenticationException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest(ADMIN_MAIL, "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        verify(jwtUtils, never()).generateJwtToken(any());
    }

    @Test
    void register_whenEmailAvailable_encodesPasswordAndSavesUser() {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@test.com");
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("secret12");

        when(userService.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret12")).thenReturn("encoded-secret");

        authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService).save(userCaptor.capture());

        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("new@test.com");
        assertThat(saved.getFirstName()).isEqualTo("Emma");
        assertThat(saved.getLastName()).isEqualTo("Petit");
        assertThat(saved.getPassword()).isEqualTo("encoded-secret");
        assertThat(saved.isAdmin()).isFalse();
    }

    @Test
    void register_whenEmailAlreadyExists_throwsBadRequestException() {
        SignupRequest request = new SignupRequest();
        request.setEmail("existing@test.com");
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("secret12");

        when(userService.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class);

        verify(userService, never()).save(any(User.class));
    }
}