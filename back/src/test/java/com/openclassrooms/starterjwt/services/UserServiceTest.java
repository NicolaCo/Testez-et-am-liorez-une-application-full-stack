package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final long USER_ID = 1L;
    public static final long UNKNOWN_ID = 99L;
    private static final String USER_MAIL = "user@test.com";

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);

        user = TestFixtures.user(USER_ID, USER_MAIL);
    }

    @Test
    void findById_whenUserExists_returnsUser() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        assertThat(userService.findById(USER_ID)).isEqualTo(user);
    }

    @Test
    void findById_whenUserMissing_throwsNotFoundException() {
        when(userRepository.findById(UNKNOWN_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(UNKNOWN_ID))
                .isInstanceOf(NotFoundException.class);
    }

}