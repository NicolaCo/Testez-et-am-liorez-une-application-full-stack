package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private static final Long USER_ID = 1L;
    private static final String USER_EMAIL = "u1@test.com";
    private static final String USER_LAST_NAME = "Bernard";
    private static final String USER_FIRST_NAME = "Alex";
    private static final String USER_PASSWORD = "encoded";
    private static final LocalDateTime CREATED_AT = LocalDateTime.of(2026, 9, 15, 9, 30);
    private static final LocalDateTime UPDATED_AT = LocalDateTime.of(2026, 10, 3, 18, 0);

    private UserMapper userMapper;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapperImpl();
    }

    private UserDto userDto() {
        UserDto dto = new UserDto();
        dto.setId(USER_ID);
        dto.setEmail(USER_EMAIL);
        dto.setLastName(USER_LAST_NAME);
        dto.setFirstName(USER_FIRST_NAME);
        dto.setPassword(USER_PASSWORD);
        dto.setAdmin(true);
        dto.setCreatedAt(CREATED_AT);
        dto.setUpdatedAt(UPDATED_AT);
        return dto;
    }

    @Test
    void toEntity_mapsEveryField() {
        User user = userMapper.toEntity(userDto());

        assertThat(user.getId()).isEqualTo(USER_ID);
        assertThat(user.getEmail()).isEqualTo(USER_EMAIL);
        assertThat(user.getLastName()).isEqualTo(USER_LAST_NAME);
        assertThat(user.getFirstName()).isEqualTo(USER_FIRST_NAME);
        assertThat(user.getPassword()).isEqualTo(USER_PASSWORD);
        assertThat(user.isAdmin()).isTrue();
        assertThat(user.getCreatedAt()).isEqualTo(CREATED_AT);
        assertThat(user.getUpdatedAt()).isEqualTo(UPDATED_AT);
    }

    @Test
    void toEntity_whenDtoNull_returnsNull() {
        assertThat(userMapper.toEntity((UserDto) null)).isNull();
    }

    @Test
    void toDto_mapsEveryField() {
        User user = TestFixtures.user(USER_ID, USER_EMAIL, true, CREATED_AT, UPDATED_AT);

        UserDto dto = userMapper.toDto(user);

        assertThat(dto.getId()).isEqualTo(USER_ID);
        assertThat(dto.getEmail()).isEqualTo(USER_EMAIL);
        assertThat(dto.getLastName()).isEqualTo(USER_LAST_NAME);
        assertThat(dto.getFirstName()).isEqualTo(USER_FIRST_NAME);
        assertThat(dto.getPassword()).isEqualTo(USER_PASSWORD);
        assertThat(dto.isAdmin()).isTrue();
        assertThat(dto.getCreatedAt()).isEqualTo(CREATED_AT);
        assertThat(dto.getUpdatedAt()).isEqualTo(UPDATED_AT);
    }

    @Test
    void toDto_whenEntityNull_returnsNull() {
        assertThat(userMapper.toDto((User) null)).isNull();
    }

    @Test
    void toEntityList_mapsEveryDto() {
        List<User> users = userMapper.toEntity(List.of(userDto(), userDto()));

        assertThat(users).hasSize(2);
        assertThat(users).extracting(User::getEmail).containsExactly(USER_EMAIL, USER_EMAIL);
        assertThat(users).extracting(User::getId).containsExactly(USER_ID, USER_ID);
    }

    @Test
    void toEntityList_whenListNull_returnsNull() {
        assertThat(userMapper.toEntity((List<UserDto>) null)).isNull();
    }

    @Test
    void toDtoList_mapsEveryEntity() {
        List<User> entities = List.of(
                TestFixtures.user(USER_ID, USER_EMAIL, true, CREATED_AT, UPDATED_AT),
                TestFixtures.user(2L, "u2@test.com", false, CREATED_AT, UPDATED_AT));

        List<UserDto> dtos = userMapper.toDto(entities);

        assertThat(dtos).hasSize(2);
        assertThat(dtos).extracting(UserDto::getEmail).containsExactly(USER_EMAIL, "u2@test.com");
        assertThat(dtos).extracting(UserDto::isAdmin).containsExactly(true, false);
    }

    @Test
    void toDtoList_whenListNull_returnsNull() {
        assertThat(userMapper.toDto((List<User>) null)).isNull();
    }
}
