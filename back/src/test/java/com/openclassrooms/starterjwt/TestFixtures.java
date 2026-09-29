package com.openclassrooms.starterjwt;

import com.openclassrooms.starterjwt.models.User;

public final class TestFixtures {

    private TestFixtures() {
    }

    public static User user(Long id, String email) {
        return user(id, email, false);
    }

    public static User user(Long id, String email, boolean admin) {
        return User.builder()
                .id(id)
                .email(email)
                .lastName("Bernard")
                .firstName("Alex")
                .password("encoded")
                .admin(admin)
                .build();
    }
}