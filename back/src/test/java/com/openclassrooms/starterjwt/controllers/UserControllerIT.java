package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerIT extends IntegrationTest {

    @Test
    void findById_whenUserExists_returnsUserWithoutPassword() throws Exception {
        User user = newUser("user@test.com", false);
        String token = adminToken();

        String response = mockMvc.perform(get("/api/user/{id}", user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andReturn().getResponse().getContentAsString();

        assertThat(response).doesNotContain("password");
    }

    @Test
    void findById_whenUserMissing_returnsNotFound() throws Exception {
        String token = adminToken();

        mockMvc.perform(get("/api/user/{id}", UNKNOWN_ID)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_whenAuthenticatedUserOwnsAccount_deletesUser() throws Exception {
        User user = newUser("user@test.com", false);
        String token = loginToken("user@test.com", "test!1234");

        mockMvc.perform(delete("/api/user/{id}", user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

    @Test
    void delete_whenAuthenticatedUserDiffers_returnsUnauthorized() throws Exception {
        User admin = userRepository.findByEmail(ADMIN_EMAIL).orElseThrow();
        newUser("other@test.com", false);
        String token = loginToken("other@test.com", "test!1234");

        mockMvc.perform(delete("/api/user/{id}", admin.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());

        assertThat(userRepository.findById(admin.getId())).isPresent();
    }
}