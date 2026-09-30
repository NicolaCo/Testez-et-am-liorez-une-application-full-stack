package com.openclassrooms.starterjwt;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;

import java.time.LocalDateTime;

public final class TestFixtures {

    private TestFixtures() {
    }

    public static User user(Long id, String email) {
        return user(id, email, false);
    }

    public static User user(Long id, String email, boolean admin) {
        return user(id, email, admin, null, null);
    }

    public static User user(Long id, String email, boolean admin, LocalDateTime createdAt, LocalDateTime updatedAt) {
        return User.builder()
                .id(id)
                .email(email)
                .lastName("Bernard")
                .firstName("Alex")
                .password("encoded")
                .admin(admin)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

    public static Teacher teacher(Long id, String lastName, String firstName) {
        return teacher(id, lastName, firstName, null, null);
    }

    public static Teacher teacher(Long id, String lastName, String firstName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        return Teacher.builder()
                .id(id)
                .lastName(lastName)
                .firstName(firstName)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
