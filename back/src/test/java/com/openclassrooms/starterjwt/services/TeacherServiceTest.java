package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
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
class TeacherServiceTest {

    private static final long TEACHER_ID = 1L;
    private static final long UNKNOWN_TEACHER_ID = 99L;

    @Mock
    private TeacherRepository teacherRepository;

    private TeacherService teacherService;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacherService = new TeacherService(teacherRepository);

        teacher = Teacher.builder()
                .id(TEACHER_ID)
                .lastName("Meyer")
                .firstName("Nora")
                .build();
    }

    @Test
    void findById_whenTeacherExists_returnsTeacher() {
        when(teacherRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));

        assertThat(teacherService.findById(TEACHER_ID)).isEqualTo(teacher);
    }

    @Test
    void findById_whenTeacherMissing_throwsNotFoundException() {
        when(teacherRepository.findById(UNKNOWN_TEACHER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(UNKNOWN_TEACHER_ID))
                .isInstanceOf(NotFoundException.class);
    }
}