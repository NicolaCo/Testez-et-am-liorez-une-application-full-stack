package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.TestFixtures;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TeacherMapperTest {

    private static final Long TEACHER_ID = 5L;
    private static final String TEACHER_LAST_NAME = "Meyer";
    private static final String TEACHER_FIRST_NAME = "Nora";
    private static final LocalDateTime CREATED_AT = LocalDateTime.of(2026, 9, 15, 9, 30);
    private static final LocalDateTime UPDATED_AT = LocalDateTime.of(2026, 10, 3, 18, 0);

    private TeacherMapper teacherMapper;

    @BeforeEach
    void setUp() {
        teacherMapper = new TeacherMapperImpl();
    }

    private TeacherDto teacherDto() {
        TeacherDto dto = new TeacherDto();
        dto.setId(TEACHER_ID);
        dto.setLastName(TEACHER_LAST_NAME);
        dto.setFirstName(TEACHER_FIRST_NAME);
        dto.setCreatedAt(CREATED_AT);
        dto.setUpdatedAt(UPDATED_AT);
        return dto;
    }

    @Test
    void toEntity_mapsEveryField() {
        Teacher teacher = teacherMapper.toEntity(teacherDto());

        assertThat(teacher.getId()).isEqualTo(TEACHER_ID);
        assertThat(teacher.getLastName()).isEqualTo(TEACHER_LAST_NAME);
        assertThat(teacher.getFirstName()).isEqualTo(TEACHER_FIRST_NAME);
        assertThat(teacher.getCreatedAt()).isEqualTo(CREATED_AT);
        assertThat(teacher.getUpdatedAt()).isEqualTo(UPDATED_AT);
    }

    @Test
    void toEntity_whenDtoNull_returnsNull() {
        assertThat(teacherMapper.toEntity((TeacherDto) null)).isNull();
    }

    @Test
    void toDto_mapsEveryField() {
        Teacher teacher = TestFixtures.teacher(TEACHER_ID, TEACHER_LAST_NAME, TEACHER_FIRST_NAME, CREATED_AT, UPDATED_AT);

        TeacherDto dto = teacherMapper.toDto(teacher);

        assertThat(dto.getId()).isEqualTo(TEACHER_ID);
        assertThat(dto.getLastName()).isEqualTo(TEACHER_LAST_NAME);
        assertThat(dto.getFirstName()).isEqualTo(TEACHER_FIRST_NAME);
        assertThat(dto.getCreatedAt()).isEqualTo(CREATED_AT);
        assertThat(dto.getUpdatedAt()).isEqualTo(UPDATED_AT);
    }

    @Test
    void toDto_whenEntityNull_returnsNull() {
        assertThat(teacherMapper.toDto((Teacher) null)).isNull();
    }

    @Test
    void toEntityList_mapsEveryDto() {
        List<Teacher> teachers = teacherMapper.toEntity(List.of(teacherDto(), teacherDto()));

        assertThat(teachers).hasSize(2);
        assertThat(teachers).extracting(Teacher::getId).containsExactly(TEACHER_ID, TEACHER_ID);
        assertThat(teachers).extracting(Teacher::getLastName).containsExactly(TEACHER_LAST_NAME, TEACHER_LAST_NAME);
    }

    @Test
    void toEntityList_whenListNull_returnsNull() {
        assertThat(teacherMapper.toEntity((List<TeacherDto>) null)).isNull();
    }

    @Test
    void toDtoList_mapsEveryEntity() {
        List<Teacher> entities = List.of(
                TestFixtures.teacher(TEACHER_ID, TEACHER_LAST_NAME, TEACHER_FIRST_NAME, CREATED_AT, UPDATED_AT),
                TestFixtures.teacher(6L, "Petit", "Paul", CREATED_AT, UPDATED_AT));

        List<TeacherDto> dtos = teacherMapper.toDto(entities);

        assertThat(dtos).hasSize(2);
        assertThat(dtos).extracting(TeacherDto::getId).containsExactly(TEACHER_ID, 6L);
        assertThat(dtos).extracting(TeacherDto::getFirstName).containsExactly(TEACHER_FIRST_NAME, "Paul");
    }

    @Test
    void toDtoList_whenListNull_returnsNull() {
        assertThat(teacherMapper.toDto((List<Teacher>) null)).isNull();
    }
}
