package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import org.junit.jupiter.api.Test;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthSecurityIT extends IntegrationTest {

    @Test
    void protectedEndpoints_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/user/{id}", UNKNOWN_ID))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/session")
                        .contentType(APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/session/{id}", UNKNOWN_ID)
                        .contentType(APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/session/{id}", UNKNOWN_ID))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", UNKNOWN_ID, UNKNOWN_ID))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", UNKNOWN_ID, UNKNOWN_ID))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/user/{id}", UNKNOWN_ID))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoints_withInvalidToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authEndpoint_isPubliclyAccessible() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(ADMIN_EMAIL);
        request.setPassword(ADMIN_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}