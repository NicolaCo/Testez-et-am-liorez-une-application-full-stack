package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionControllerIT extends IntegrationTest {

    public static final String MORNING_YOGA = "Morning Yoga";
    public static final String MORNING_STRETCH = "Morning Stretch";

    private SessionDto sessionDto(Long teacherId) {
        SessionDto dto = new SessionDto();
        dto.setName(MORNING_YOGA);
        dto.setDescription(MORNING_STRETCH);
        dto.setDate(new Date());
        dto.setTeacher_id(teacherId);
        dto.setUsers(List.of());
        return dto;
    }

    @Test
    void findById_whenSessionExists_returnsSession() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        String token = adminToken();

        mockMvc.perform(get("/api/session/{id}", session.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value(MORNING_YOGA))
                .andExpect(jsonPath("$.description").value(MORNING_STRETCH))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()))
                .andExpect(jsonPath("$.users").isArray());
    }

    @Test
    void findById_whenSessionMissing_returnsNotFound() throws Exception {
        String token = adminToken();

        mockMvc.perform(get("/api/session/{id}", UNKNOWN_ID)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void findById_withNonNumericId_returnsBadRequest() throws Exception {
        String token = adminToken();

        mockMvc.perform(get("/api/session/{id}", "abc")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findAll_returnsAllSessions() throws Exception {
        Teacher teacher1 = persistedTeacher("Meyer", "Nora");
        Teacher teacher2 = persistedTeacher("Garnier", "Marc");
        persistedSession(teacher1);
        persistedSession(teacher2);
        String token = adminToken();

        mockMvc.perform(get("/api/session")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void create_withValidPayload_returnsCreatedSession() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        String token = adminToken();

        MvcResult result = mockMvc.perform(post("/api/session")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto(teacher.getId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(MORNING_YOGA))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()))
                .andReturn();

        long createdId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asLong();
        assertThat(sessionRepository.findById(createdId)).get()
                .extracting(Session::getName).isEqualTo(MORNING_YOGA);
    }

    @Test
    void create_withUnknownTeacher_returnsNotFound() throws Exception {
        String token = adminToken();

        mockMvc.perform(post("/api/session")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto(UNKNOWN_ID))))
                .andExpect(status().isNotFound());

        assertThat(sessionRepository.count()).isZero();
    }

    @Test
    void create_withBlankName_returnsBadRequest() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        SessionDto dto = sessionDto(teacher.getId());
        dto.setName(" ");
        String token = adminToken();

        mockMvc.perform(post("/api/session")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        assertThat(sessionRepository.count()).isZero();
    }

    @Test
    void update_withValidPayload_updatesSession() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        SessionDto dto = sessionDto(teacher.getId());
        dto.setName("Late night Yoga");
        String token = adminToken();

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value("Late night Yoga"));

        assertThat(sessionRepository.findById(session.getId())).get()
                .extracting(Session::getName).isEqualTo("Late night Yoga");
    }

    @Test
    void delete_whenSessionExists_deletesIt() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        String token = adminToken();

        mockMvc.perform(delete("/api/session/{id}", session.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }

    @Test
    void delete_whenSessionMissing_returnsNotFound() throws Exception {
        String token = adminToken();

        mockMvc.perform(delete("/api/session/{id}", UNKNOWN_ID)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void participate_whenSessionAndUserExist_addsUser() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        assertThat(sessionRepository.findById(session.getId())).get()
                .extracting(Session::getUsers)
                .satisfies(users -> assertThat(users).extracting(User::getId).contains(user.getId()));
    }

    @Test
    void participate_whenUserAlreadyParticipating_returnsBadRequest() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());

        assertThat(sessionRepository.findById(session.getId())).get()
                .extracting(Session::getUsers)
                .satisfies(users -> assertThat(users).extracting(User::getId).containsOnlyOnce(user.getId()));
    }

    @Test
    void participate_whenSessionMissing_returnsNotFound() throws Exception {
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", UNKNOWN_ID, user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void noLongerParticipate_whenUserParticipating_removesUser() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        assertThat(sessionRepository.findById(session.getId())).get()
                .extracting(Session::getUsers)
                .satisfies(users -> assertThat(users).extracting(User::getId).doesNotContain(user.getId()));
    }

    @Test
    void noLongerParticipate_whenUserNotParticipating_returnsBadRequest() throws Exception {
        Teacher teacher = persistedTeacher("Meyer", "Nora");
        Session session = persistedSession(teacher);
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());

        assertThat(sessionRepository.findById(session.getId())).get()
                .extracting(Session::getUsers)
                .satisfies(users -> assertThat(users).isEmpty());
    }

    @Test
    void noLongerParticipate_whenSessionMissing_returnsNotFound() throws Exception {
        User user = newUser("participant@test.com", false);
        String token = adminToken();

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", UNKNOWN_ID, user.getId())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }
}