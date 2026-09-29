package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TeacherControllerIT extends IntegrationTest {

    @Test
    void findAll_returnsAllTeachers() throws Exception {
        persistedTeacher("Meyer", "Nora");
        persistedTeacher("Garnier", "Marc");
        String token = adminToken();

        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void findById_whenTeacherExists_returnsTeacher() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        String token = adminToken();

        mockMvc.perform(get("/api/teacher/{id}", teacher.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher.getId()))
                .andExpect(jsonPath("$.lastName").value("Meyer"))
                .andExpect(jsonPath("$.firstName").value("Nora"));
    }

    @Test
    void findById_whenTeacherMissing_returnsNotFound() throws Exception {
        String token = adminToken();

        mockMvc.perform(get("/api/teacher/{id}", UNKNOWN_ID)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }
}