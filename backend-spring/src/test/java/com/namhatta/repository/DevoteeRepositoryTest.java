package com.namhatta.repository;

import com.namhatta.model.entity.Devotee;
import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.model.enums.MaritalStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class DevoteeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DevoteeRepository devoteeRepository;

    private Devotee testDevotee1;
    private Devotee testDevotee2;

    @BeforeEach
    void setUp() {
        testDevotee1 = new Devotee();
        testDevotee1.setLegalName("John Doe");
        testDevotee1.setName("Krishna Das");
        testDevotee1.setEmail("john@test.com");
        testDevotee1.setPhone("1234567890");
        testDevotee1.setGender(Gender.MALE);
        testDevotee1.setMaritalStatus(MaritalStatus.UNMARRIED);
        testDevotee1.setDob(LocalDate.of(1990, 1, 1));
        testDevotee1.setLeadershipRole(LeadershipRole.CHAKRA_SENAPOTI);
        entityManager.persist(testDevotee1);

        testDevotee2 = new Devotee();
        testDevotee2.setLegalName("Jane Smith");
        testDevotee2.setName("Radha Devi");
        testDevotee2.setEmail("jane@test.com");
        testDevotee2.setPhone("0987654321");
        testDevotee2.setGender(Gender.FEMALE);
        testDevotee2.setMaritalStatus(MaritalStatus.MARRIED);
        testDevotee2.setDob(LocalDate.of(1992, 5, 15));
        testDevotee2.setReportingToDevoteeId(testDevotee1.getId());
        entityManager.persist(testDevotee2);

        entityManager.flush();
    }

    @Test
    void findByReportingToDevoteeId_ShouldReturnSubordinates() {
        List<Devotee> subordinates = devoteeRepository.findByReportingToDevoteeId(testDevotee1.getId());

        assertThat(subordinates).hasSize(1);
        assertThat(subordinates.get(0).getId()).isEqualTo(testDevotee2.getId());
        assertThat(subordinates.get(0).getLegalName()).isEqualTo("Jane Smith");
    }

    @Test
    void findByLeadershipRoleNotNull_ShouldReturnLeaders() {
        List<Devotee> leaders = devoteeRepository.findByLeadershipRoleNotNull();

        assertThat(leaders).isNotEmpty();
        assertThat(leaders).anyMatch(d -> d.getId().equals(testDevotee1.getId()));
        assertThat(leaders).allMatch(d -> d.getLeadershipRole() != null);
    }

    @Test
    void findByLeadershipRole_ShouldReturnDevoteesWithSpecificRole() {
        List<Devotee> chakraSenapotis = devoteeRepository.findByLeadershipRole(LeadershipRole.CHAKRA_SENAPOTI);

        assertThat(chakraSenapotis).hasSize(1);
        assertThat(chakraSenapotis.get(0).getId()).isEqualTo(testDevotee1.getId());
    }

    @Test
    void save_ShouldPersistDevotee() {
        Devotee newDevotee = new Devotee();
        newDevotee.setLegalName("Test Save");
        newDevotee.setName("Save Das");
        newDevotee.setEmail("save@test.com");
        newDevotee.setPhone("1111111111");
        newDevotee.setGender(Gender.MALE);
        newDevotee.setMaritalStatus(MaritalStatus.UNMARRIED);
        newDevotee.setDob(LocalDate.of(1995, 3, 20));

        Devotee saved = devoteeRepository.save(newDevotee);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getLegalName()).isEqualTo("Test Save");
        
        Devotee found = entityManager.find(Devotee.class, saved.getId());
        assertThat(found).isNotNull();
        assertThat(found.getLegalName()).isEqualTo("Test Save");
    }
}
