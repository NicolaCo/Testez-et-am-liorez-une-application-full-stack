package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionMapperTest {

    public static final Long SESSION_ID = 1L;
    public static final long USER_1_ID = 1L;
    public static final long USER_2_ID = 2L;
    public static final long TEACHER_ID = 5L;
    public static final String SESSION_NAME = "Morning Yoga";
    public static final String SESSION_DESCRIPTION = "Morning Stretch";
    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    private SessionMapper sessionMapper;

    private Date date;

    @BeforeEach
    void setUp() {
        sessionMapper = new SessionMapperImpl();
        sessionMapper.teacherService = teacherService;
        sessionMapper.userService = userService;

        date = new Date();
    }

    private Session sessionWith(Teacher teacher, List<User> users) {
        return Session.builder()
                .id(1L)
                .name(SESSION_NAME)
                .description(SESSION_DESCRIPTION)
                .date(date)
                .teacher(teacher)
                .users(users)
                .build();
    }

    private User user(Long id, String email) {
        return TestFixtures.user(id, email);
    }

    private SessionDto sessionDtoWithoutRelations() {
        SessionDto dto = new SessionDto();
        dto.setId(SESSION_ID);
        dto.setName(SESSION_NAME);
        dto.setDescription(SESSION_DESCRIPTION);
        dto.setDate(date);
        dto.setTeacher_id(null);
        dto.setUsers(null);
        return dto;
    }

    @Test
    void toDto_mapsTeacherAndUserIds() {
        Teacher teacher = TestFixtures.teacher(TEACHER_ID, "Meyer", "Nora");;
        User user1 = user(USER_1_ID, "u1@test.com");
        User user2 = user(USER_2_ID, "u2@test.com");
        Session session = sessionWith(teacher, List.of(user1, user2));

        SessionDto dto = sessionMapper.toDto(session);

        assertThat(dto.getId()).isEqualTo(SESSION_ID);
        assertThat(dto.getName()).isEqualTo(SESSION_NAME);
        assertThat(dto.getDescription()).isEqualTo(SESSION_DESCRIPTION);
        assertThat(dto.getDate()).isEqualTo(date);
        assertThat(dto.getTeacher_id()).isEqualTo(TEACHER_ID);
        assertThat(dto.getUsers()).containsExactly(USER_1_ID, USER_2_ID);
    }

    @Test
    void toDto_whenNoTeacherAndNoUsers_mapsNullAndEmpty() {
        Session session = sessionWith(null, null);

        SessionDto dto = sessionMapper.toDto(session);

        assertThat(dto.getTeacher_id()).isNull();
        assertThat(dto.getUsers()).isEmpty();
    }

    @Test
    void toEntity_mapsTeacherAndUsersFromServices() {
        Teacher teacher = TestFixtures.teacher(TEACHER_ID, "Meyer", "Nora");;
        User user1 = user(USER_1_ID, "u1@test.com");
        User user2 = user(USER_2_ID, "u2@test.com");

        when(teacherService.findById(TEACHER_ID)).thenReturn(teacher);
        when(userService.findById(USER_1_ID)).thenReturn(user1);
        when(userService.findById(USER_2_ID)).thenReturn(user2);

        SessionDto dto = new SessionDto();
        dto.setId(SESSION_ID);
        dto.setName(SESSION_NAME);
        dto.setDescription(SESSION_DESCRIPTION);
        dto.setDate(date);
        dto.setTeacher_id(TEACHER_ID);
        dto.setUsers(List.of(USER_1_ID, USER_2_ID));

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getId()).isEqualTo(SESSION_ID);
        assertThat(session.getName()).isEqualTo(SESSION_NAME);
        assertThat(session.getDate()).isEqualTo(date);
        assertThat(session.getTeacher()).isEqualTo(teacher);
        assertThat(session.getUsers()).containsExactly(user1, user2);
    }

    @Test
    void toEntity_whenTeacherIdNull_doesNotCallTeacherService() {
        SessionDto dto = new SessionDto();
        dto.setName(SESSION_NAME);
        dto.setDescription(SESSION_DESCRIPTION);
        dto.setDate(date);
        dto.setTeacher_id(null);
        dto.setUsers(new ArrayList<>());

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getTeacher()).isNull();
        assertThat(session.getUsers()).isEmpty();
        verify(teacherService, never()).findById(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void toEntity_whenUsersNull_mapsEmptyList() {
        SessionDto dto = new SessionDto();
        dto.setName(SESSION_NAME);
        dto.setDescription(SESSION_DESCRIPTION);
        dto.setDate(date);
        dto.setTeacher_id(TEACHER_ID);
        dto.setUsers(null);

        when(teacherService.findById(TEACHER_ID)).thenReturn(Teacher.builder().id(TEACHER_ID).build());

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getUsers()).isEmpty();
    }

    @Test
    void toEntity_whenUserNotFound_containsNullUser() {
        when(userService.findById(USER_1_ID)).thenReturn(null);

        SessionDto dto = new SessionDto();
        dto.setName(SESSION_NAME);
        dto.setDescription(SESSION_DESCRIPTION);
        dto.setDate(date);
        dto.setTeacher_id(null);
        dto.setUsers(List.of(USER_1_ID));

        Session session = sessionMapper.toEntity(dto);

        assertThat(session.getUsers()).containsOnlyNulls();
    }

    @Test
    void toEntity_whenDtoNull_returnsNull() {
        assertThat(sessionMapper.toEntity((SessionDto) null)).isNull();
    }

    @Test
    void toDto_whenSessionNull_returnsNull() {
        assertThat(sessionMapper.toDto((Session) null)).isNull();
    }

    @Test
    void toEntityList_mapsEveryDto() {
        List<Session> sessions = sessionMapper.toEntity(List.of(sessionDtoWithoutRelations(), sessionDtoWithoutRelations()));

        assertThat(sessions).hasSize(2);
        assertThat(sessions).extracting(Session::getName).containsExactly(SESSION_NAME, SESSION_NAME);
        assertThat(sessions).allSatisfy(session -> {
            assertThat(session.getTeacher()).isNull();
            assertThat(session.getUsers()).isEmpty();
        });
    }

    @Test
    void toEntityList_whenListNull_returnsNull() {
        assertThat(sessionMapper.toEntity((List<SessionDto>) null)).isNull();
    }

    @Test
    void toDtoList_whenListNull_returnsNull() {
        assertThat(sessionMapper.toDto((List<Session>) null)).isNull();
    }
}