package com.namhatta.repository;

import com.namhatta.model.entity.Namhatta;
import com.namhatta.model.enums.NamhattaStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class NamhattaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private NamhattaRepository namhattaRepository;

    private Namhatta testNamhatta;

    @BeforeEach
    void setUp() {
        testNamhatta = new Namhatta();
        testNamhatta.setCode("NH001");
        testNamhatta.setName("Test Namhatta");
        testNamhatta.setMeetingDay("Sunday");
        testNamhatta.setMeetingTime(LocalTime.of(10, 0));
        testNamhatta.setStatus(NamhattaStatus.PENDING_APPROVAL);
        testNamhatta.setDistrictSupervisorId(1L);
        entityManager.persist(testNamhatta);
        entityManager.flush();
    }

    @Test
    void findByCode_WithExistingCode_ShouldReturnNamhatta() {
        Optional<Namhatta> found = namhattaRepository.findByCode("NH001");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Namhatta");
    }

    @Test
    void findByCode_WithNonexistentCode_ShouldReturnEmpty() {
        Optional<Namhatta> found = namhattaRepository.findByCode("NH999");

        assertThat(found).isEmpty();
    }

    @Test
    void existsByCode_WithExistingCode_ShouldReturnTrue() {
        boolean exists = namhattaRepository.existsByCode("NH001");

        assertThat(exists).isTrue();
    }

    @Test
    void existsByCode_WithNonexistentCode_ShouldReturnFalse() {
        boolean exists = namhattaRepository.existsByCode("NH999");

        assertThat(exists).isFalse();
    }

    @Test
    void findByRegistrationNo_WithExistingNo_ShouldReturnNamhatta() {
        testNamhatta.setRegistrationNo("REG123");
        testNamhatta.setStatus(NamhattaStatus.APPROVED);
        entityManager.merge(testNamhatta);
        entityManager.flush();

        Optional<Namhatta> found = namhattaRepository.findByRegistrationNo("REG123");

        assertThat(found).isPresent();
        assertThat(found.get().getCode()).isEqualTo("NH001");
    }

    @Test
    void existsByRegistrationNo_WithExistingNo_ShouldReturnTrue() {
        testNamhatta.setRegistrationNo("REG456");
        entityManager.merge(testNamhatta);
        entityManager.flush();

        boolean exists = namhattaRepository.existsByRegistrationNo("REG456");

        assertThat(exists).isTrue();
    }

    @Test
    void save_ShouldPersistNamhatta() {
        Namhatta newNamhatta = new Namhatta();
        newNamhatta.setCode("NH002");
        newNamhatta.setName("New Test Namhatta");
        newNamhatta.setMeetingDay("Saturday");
        newNamhatta.setMeetingTime(LocalTime.of(18, 0));
        newNamhatta.setStatus(NamhattaStatus.PENDING_APPROVAL);
        newNamhatta.setDistrictSupervisorId(2L);

        Namhatta saved = namhattaRepository.save(newNamhatta);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCode()).isEqualTo("NH002");
        
        Namhatta found = entityManager.find(Namhatta.class, saved.getId());
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("New Test Namhatta");
    }
}
