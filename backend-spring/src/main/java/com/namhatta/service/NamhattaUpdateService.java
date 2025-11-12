package com.namhatta.service;

import com.namhatta.model.entity.NamhattaUpdate;
import com.namhatta.repository.NamhattaUpdateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NamhattaUpdateService {

    private final NamhattaUpdateRepository namhattaUpdateRepository;

    public NamhattaUpdateService(NamhattaUpdateRepository namhattaUpdateRepository) {
        this.namhattaUpdateRepository = namhattaUpdateRepository;
    }

    public static class NamhattaUpdateRequest {
        private Long namhattaId;
        private String programType;
        private String date;
        private Integer attendance;
        private Integer prasadDistribution;
        private Integer nagarKirtan;
        private Integer bookDistribution;
        private Integer chanting;
        private Integer arati;
        private Integer bhagwatPath;
        private List<String> imageUrls;
        private String facebookLink;
        private String youtubeLink;
        private String specialAttraction;

        // Getters and setters
        public Long getNamhattaId() { return namhattaId; }
        public void setNamhattaId(Long namhattaId) { this.namhattaId = namhattaId; }

        public String getProgramType() { return programType; }
        public void setProgramType(String programType) { this.programType = programType; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public Integer getAttendance() { return attendance; }
        public void setAttendance(Integer attendance) { this.attendance = attendance; }

        public Integer getPrasadDistribution() { return prasadDistribution; }
        public void setPrasadDistribution(Integer prasadDistribution) { this.prasadDistribution = prasadDistribution; }

        public Integer getNagarKirtan() { return nagarKirtan; }
        public void setNagarKirtan(Integer nagarKirtan) { this.nagarKirtan = nagarKirtan; }

        public Integer getBookDistribution() { return bookDistribution; }
        public void setBookDistribution(Integer bookDistribution) { this.bookDistribution = bookDistribution; }

        public Integer getChanting() { return chanting; }
        public void setChanting(Integer chanting) { this.chanting = chanting; }

        public Integer getArati() { return arati; }
        public void setArati(Integer arati) { this.arati = arati; }

        public Integer getBhagwatPath() { return bhagwatPath; }
        public void setBhagwatPath(Integer bhagwatPath) { this.bhagwatPath = bhagwatPath; }

        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

        public String getFacebookLink() { return facebookLink; }
        public void setFacebookLink(String facebookLink) { this.facebookLink = facebookLink; }

        public String getYoutubeLink() { return youtubeLink; }
        public void setYoutubeLink(String youtubeLink) { this.youtubeLink = youtubeLink; }

        public String getSpecialAttraction() { return specialAttraction; }
        public void setSpecialAttraction(String specialAttraction) { this.specialAttraction = specialAttraction; }
    }

    public NamhattaUpdate createUpdate(NamhattaUpdateRequest request) {
        NamhattaUpdate update = new NamhattaUpdate();
        update.setNamhattaId(request.getNamhattaId());
        update.setProgramType(request.getProgramType());
        update.setDate(request.getDate());
        update.setAttendance(request.getAttendance());
        update.setPrasadDistribution(request.getPrasadDistribution());
        update.setNagarKirtan(request.getNagarKirtan() != null ? request.getNagarKirtan() : 0);
        update.setBookDistribution(request.getBookDistribution() != null ? request.getBookDistribution() : 0);
        update.setChanting(request.getChanting() != null ? request.getChanting() : 0);
        update.setArati(request.getArati() != null ? request.getArati() : 0);
        update.setBhagwatPath(request.getBhagwatPath() != null ? request.getBhagwatPath() : 0);
        update.setImageUrls(request.getImageUrls());
        update.setFacebookLink(request.getFacebookLink());
        update.setYoutubeLink(request.getYoutubeLink());
        update.setSpecialAttraction(request.getSpecialAttraction());
        
        return namhattaUpdateRepository.save(update);
    }

    public List<NamhattaUpdate> getAllUpdates() {
        return namhattaUpdateRepository.findAllByOrderByDateDesc();
    }

    public List<NamhattaUpdate> getByNamhatta(Long namhattaId) {
        return namhattaUpdateRepository.findByNamhattaIdOrderByDateDesc(namhattaId);
    }
}
