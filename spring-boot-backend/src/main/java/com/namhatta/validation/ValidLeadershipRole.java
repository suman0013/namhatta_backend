package com.namhatta.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LeadershipRoleValidator.class)
@Documented
public @interface ValidLeadershipRole {
    
    String message() default "Invalid leadership role. Must be one of: MALA_SENAPOTI, MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
