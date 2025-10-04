package com.namhatta.util;

import com.namhatta.model.enums.LeadershipRole;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class RoleHierarchyRules {

    public static class HierarchyEntry {
        private final int level;
        private final String reportsTo;
        private final List<LeadershipRole> canPromoteTo;
        private final List<LeadershipRole> canDemoteTo;
        private final List<LeadershipRole> manages;

        public HierarchyEntry(int level, String reportsTo, List<LeadershipRole> canPromoteTo, 
                            List<LeadershipRole> canDemoteTo, List<LeadershipRole> manages) {
            this.level = level;
            this.reportsTo = reportsTo;
            this.canPromoteTo = canPromoteTo != null ? canPromoteTo : Collections.emptyList();
            this.canDemoteTo = canDemoteTo != null ? canDemoteTo : Collections.emptyList();
            this.manages = manages != null ? manages : Collections.emptyList();
        }

        public int getLevel() { return level; }
        public String getReportsTo() { return reportsTo; }
        public List<LeadershipRole> getCanPromoteTo() { return canPromoteTo; }
        public List<LeadershipRole> getCanDemoteTo() { return canDemoteTo; }
        public List<LeadershipRole> getManages() { return manages; }
    }

    private static final Map<LeadershipRole, HierarchyEntry> ROLE_HIERARCHY = new HashMap<>();

    static {
        ROLE_HIERARCHY.put(LeadershipRole.MALA_SENAPOTI, new HierarchyEntry(
            1, 
            "DISTRICT_SUPERVISOR", 
            null, 
            Arrays.asList(LeadershipRole.MAHA_CHAKRA_SENAPOTI, LeadershipRole.CHAKRA_SENAPOTI, LeadershipRole.UPA_CHAKRA_SENAPOTI),
            Arrays.asList(LeadershipRole.MAHA_CHAKRA_SENAPOTI)
        ));

        ROLE_HIERARCHY.put(LeadershipRole.MAHA_CHAKRA_SENAPOTI, new HierarchyEntry(
            2, 
            "MALA", 
            Arrays.asList(LeadershipRole.MALA_SENAPOTI), 
            Arrays.asList(LeadershipRole.CHAKRA_SENAPOTI, LeadershipRole.UPA_CHAKRA_SENAPOTI),
            Arrays.asList(LeadershipRole.CHAKRA_SENAPOTI)
        ));

        ROLE_HIERARCHY.put(LeadershipRole.CHAKRA_SENAPOTI, new HierarchyEntry(
            3, 
            "MAHA_CHAKRA", 
            Arrays.asList(LeadershipRole.MAHA_CHAKRA_SENAPOTI), 
            Arrays.asList(LeadershipRole.UPA_CHAKRA_SENAPOTI),
            Arrays.asList(LeadershipRole.UPA_CHAKRA_SENAPOTI)
        ));

        ROLE_HIERARCHY.put(LeadershipRole.UPA_CHAKRA_SENAPOTI, new HierarchyEntry(
            4, 
            "CHAKRA", 
            Arrays.asList(LeadershipRole.CHAKRA_SENAPOTI), 
            null,
            Collections.emptyList()
        ));
    }

    public boolean canPromote(LeadershipRole from, LeadershipRole to) {
        if (from == null || to == null) {
            return false;
        }
        
        HierarchyEntry entry = ROLE_HIERARCHY.get(from);
        if (entry == null) {
            return false;
        }
        
        return entry.getCanPromoteTo().contains(to);
    }

    public boolean canDemote(LeadershipRole from, LeadershipRole to) {
        if (from == null || to == null) {
            return false;
        }
        
        HierarchyEntry entry = ROLE_HIERARCHY.get(from);
        if (entry == null) {
            return false;
        }
        
        return entry.getCanDemoteTo().contains(to);
    }

    public String getReportingRole(LeadershipRole role) {
        if (role == null) {
            return null;
        }
        
        HierarchyEntry entry = ROLE_HIERARCHY.get(role);
        return entry != null ? entry.getReportsTo() : null;
    }

    public List<LeadershipRole> getManagedRoles(LeadershipRole role) {
        if (role == null) {
            return Collections.emptyList();
        }
        
        HierarchyEntry entry = ROLE_HIERARCHY.get(role);
        return entry != null ? entry.getManages() : Collections.emptyList();
    }

    public int getRoleLevel(LeadershipRole role) {
        if (role == null) {
            return -1;
        }
        
        HierarchyEntry entry = ROLE_HIERARCHY.get(role);
        return entry != null ? entry.getLevel() : -1;
    }

    public HierarchyEntry getHierarchyEntry(LeadershipRole role) {
        return ROLE_HIERARCHY.get(role);
    }
}
