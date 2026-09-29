package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIT extends IntegrationTest {

    @Test
    void login_withValidCredentials_returnsJwtResponse() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(ADMIN_EMAIL);
        request.setPassword(ADMIN_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value(ADMIN_EMAIL))
                .andExpect(jsonPath("$.firstName").value("Alex"))
                .andExpect(jsonPath("$.lastName").value("Bernard"))
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    void login_withUnknownCredentials_returnsInternalServerError() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(ADMIN_EMAIL);
        request.setPassword("wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void login_withBlankFields_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withValidPayload_returnsSuccessMessage() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@studio.com");
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        assertThat(userRepository.findByEmail("new@studio.com")).isPresent();
    }

    @Test
    void register_withExistingEmail_returnsBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail(ADMIN_EMAIL);
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void register_withInvalidPassword_returnsBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("emma.petit@studio.com");
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("12345");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(userRepository.findByEmail("emma.petit@studio.com")).isEmpty();
    }

    @Test
    void register_withInvalidEmail_returnsBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("not-an-email");
        request.setFirstName("Emma");
        request.setLastName("Petit");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(userRepository.findByEmail("not-an-email")).isEmpty();
    }
}