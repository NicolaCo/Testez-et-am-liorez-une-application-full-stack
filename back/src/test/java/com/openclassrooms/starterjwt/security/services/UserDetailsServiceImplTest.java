package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    public static final String USER_MAIL = "user@test.com";
    @Mock
    private UserRepository userRepository;

    private UserDetailsServiceImpl userDetailsService;

    private User user;

    @BeforeEach
    void setUp() {
        userDetailsService = new UserDetailsServiceImpl(userRepository);

        user = TestFixtures.user(1L, USER_MAIL);
    }

    @Test
    void loadUserByUsername_whenUserExists_buildsUserDetails() {
        when(userRepository.findByEmail(USER_MAIL)).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername(USER_MAIL);

        assertThat(userDetails).isInstanceOf(UserDetailsImpl.class);
        UserDetailsImpl details = (UserDetailsImpl) userDetails;
        assertThat(details.getId()).isEqualTo(1L);
        assertThat(details.getUsername()).isEqualTo(USER_MAIL);
        assertThat(details.getFirstName()).isEqualTo("Alex");
        assertThat(details.getLastName()).isEqualTo("Bernard");
        assertThat(details.getPassword()).isEqualTo("encoded");
    }

    @Test
    void loadUserByUsername_whenUserMissing_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("unknown@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}