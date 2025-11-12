package com.namhatta.validation;

import com.namhatta.model.enums.LeadershipRole;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LeadershipRoleValidator implements ConstraintValidator<ValidLeadershipRole, String> {
    
    @Override
    public void initialize(ValidLeadershipRole constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String role, ConstraintValidatorContext context) {
        if (role == null) {
            return true; // null values are handled by @NotNull if needed
        }
        
        try {
            LeadershipRole.valueOf(role);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
