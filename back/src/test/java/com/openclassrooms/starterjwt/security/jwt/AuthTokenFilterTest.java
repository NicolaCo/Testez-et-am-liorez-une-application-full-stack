package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthTokenFilterTest {

    public static final String EMAIL = "user@test.com";
    public static final String API_SESSION = "/api/session";
    public static final String HEADER_AUTHORIZATION_NAME = "Authorization";

    private AuthTokenFilter authTokenFilter;

    private JwtUtils jwtUtils;
    private UserDetailsServiceImpl userDetailsService;

    @BeforeEach
    void setUp() {
        jwtUtils = mock(JwtUtils.class);
        userDetailsService = mock(UserDetailsServiceImpl.class);

        authTokenFilter = new AuthTokenFilter();
        ReflectionTestUtils.setField(authTokenFilter, "jwtUtils", jwtUtils);
        ReflectionTestUtils.setField(authTokenFilter, "userDetailsService", userDetailsService);

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private FilterChain doFilter(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);
        authTokenFilter.doFilter(request, response, filterChain);
        return filterChain;
    }

    private UserDetailsImpl userDetails() {
        return UserDetailsImpl.builder()
                .id(1L)
                .username(EMAIL)
                .firstName("Alex")
                .lastName("Bernard")
                .password("encoded")
                .build();
    }

    @Test
    void doFilter_withoutAuthorizationHeader_skipsAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", API_SESSION);

        FilterChain filterChain = doFilter(request);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(eq(request), any());
    }

    @Test
    void doFilter_withHeaderWithoutBearerPrefix_skipsAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", API_SESSION);
        request.addHeader(HEADER_AUTHORIZATION_NAME, "Token valid-token");

        FilterChain filterChain = doFilter(request);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(eq(request), any());
    }

    @Test
    void doFilter_withValidBearerToken_setsAuthentication() throws Exception {
        UserDetailsImpl userDetails = userDetails();

        when(jwtUtils.validateJwtToken("valid-token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid-token")).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", API_SESSION);
        request.addHeader(HEADER_AUTHORIZATION_NAME, "Bearer valid-token");

        FilterChain filterChain = doFilter(request);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
        verify(filterChain).doFilter(eq(request), any());
    }

    @Test
    void doFilter_withInvalidToken_doesNotSetAuthentication() throws Exception {
        when(jwtUtils.validateJwtToken("invalid-token")).thenReturn(false);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", API_SESSION);
        request.addHeader(HEADER_AUTHORIZATION_NAME, "Bearer invalid-token");

        FilterChain filterChain = doFilter(request);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(eq(request), any());
    }

    @Test
    void doFilter_withUserLookupFailure_doesNotSetAuthentication() throws Exception {
        when(jwtUtils.validateJwtToken("valid-token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid-token")).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL))
                .thenThrow(new UsernameNotFoundException("User not found"));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", API_SESSION);
        request.addHeader(HEADER_AUTHORIZATION_NAME, "Bearer valid-token");

        FilterChain filterChain = doFilter(request);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(eq(request), any());
    }
}