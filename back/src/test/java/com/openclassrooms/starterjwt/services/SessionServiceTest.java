package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    private static final long SESSION_ID = 1L;
    private static final long UNKNOWN_SESSION_ID = 99L;
    private static final long UNKNOWN_USER_ID = 98L;
    private static final long PARTICIPANT_ID = 10L;
    private static final long SESSION_ID_TO_UPDATE = 55L;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        sessionService = new SessionService(sessionRepository, userRepository);

        session = Session.builder()
                .id(SESSION_ID)
                .name("Morning Yoga")
                .description("Morning Stretch")
                .date(new java.util.Date())
                .users(new ArrayList<>())
                .build();

        user = TestFixtures.user(PARTICIPANT_ID, "user@test.com");
    }


    @Test
    void getById_whenSessionExists_returnsSession() {
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(SESSION_ID);

        assertThat(result).isEqualTo(session);
    }

    @Test
    void getById_whenSessionMissing_throwsNotFoundException() {
        when(sessionRepository.findById(UNKNOWN_SESSION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getById(UNKNOWN_SESSION_ID))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void delete_whenSessionExists_deletesIt() {
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));

        sessionService.delete(SESSION_ID);

        verify(sessionRepository).deleteById(SESSION_ID);
    }

    @Test
    void delete_whenSessionMissing_throwsNotFoundException() {
        when(sessionRepository.findById(UNKNOWN_SESSION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.delete(UNKNOWN_SESSION_ID))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).deleteById(any());
    }

    @Test
    void update_whenSessionGiven_forcesIdAndSaves() {
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.update(SESSION_ID_TO_UPDATE, session);

        assertThat(result).isEqualTo(session);
        assertThat(result.getId()).isEqualTo(SESSION_ID_TO_UPDATE);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_whenSessionAndUserExist_addsUser() {
        session.getUsers().clear();
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));
        when(userRepository.findById(PARTICIPANT_ID)).thenReturn(Optional.of(user));

        sessionService.participate(SESSION_ID, PARTICIPANT_ID);

        assertThat(session.getUsers()).containsExactly(user);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_whenSessionMissing_throwsNotFoundException() {
        when(sessionRepository.findById(UNKNOWN_SESSION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(UNKNOWN_SESSION_ID, PARTICIPANT_ID))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_whenUserMissing_throwsNotFoundException() {
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));
        when(userRepository.findById(UNKNOWN_USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(SESSION_ID, UNKNOWN_USER_ID))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_whenAlreadyParticipating_throwsBadRequestException() {
        session.getUsers().add(user);
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));
        when(userRepository.findById(PARTICIPANT_ID)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(SESSION_ID, PARTICIPANT_ID))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_whenSessionAndUserExist_removesUser() {
        session.getUsers().add(user);
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(SESSION_ID, PARTICIPANT_ID);

        assertThat(session.getUsers()).doesNotContain(user);
        verify(sessionRepository).save(session);
    }

    @Test
    void noLongerParticipate_whenSessionMissing_throwsNotFoundException() {
        when(sessionRepository.findById(UNKNOWN_SESSION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(UNKNOWN_SESSION_ID, PARTICIPANT_ID))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_whenUserNotParticipating_throwsBadRequestException() {
        session.getUsers().clear();
        when(sessionRepository.findById(SESSION_ID)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(SESSION_ID, PARTICIPANT_ID))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }
}