package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;

import java.util.Date;
import java.util.List;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(IntegrationTest.MySqlContainerConfiguration.class)
public abstract class IntegrationTest {

    protected static final String ADMIN_EMAIL = "yoga@studio.com";
    protected static final String ADMIN_PASSWORD = "test!1234";
    protected static final long UNKNOWN_ID = 9999L;

    @TestConfiguration(proxyBeanMethods = false)
    static class MySqlContainerConfiguration {

        @Bean
        @ServiceConnection
        MySQLContainer<?> mysqlContainer() {
            return new MySQLContainer<>("mysql:8.0");
        }
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected TeacherRepository teacherRepository;

    @Autowired
    protected SessionRepository sessionRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.save(adminUser());
    }

    protected User adminUser() {
        return newUser(ADMIN_EMAIL, true);
    }

    protected User newUser(String email, boolean admin) {
        return userRepository.save(User.builder()
                .email(email)
                .lastName("Bernard")
                .firstName("Alex")
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .admin(admin)
                .build());
    }

    protected Teacher persistedTeacher(String lastName, String firstName) {
        return teacherRepository.save(Teacher.builder()
                .lastName(lastName)
                .firstName(firstName)
                .build());
    }

    protected Session persistedSession(Teacher teacher) {
        return sessionRepository.save(Session.builder()
                .name("Morning Yoga")
                .description("Morning Stretch")
                .date(new Date())
                .teacher(teacher)
                .users(List.of())
                .build());
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String loginToken(String email, String password) throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    protected String adminToken() throws Exception {
        return loginToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    }
}