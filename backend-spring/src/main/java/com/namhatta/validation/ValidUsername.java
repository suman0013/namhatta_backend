package com.namhatta.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UsernameValidator.class)
@Documented
public @interface ValidUsername {
    
    String message() default "Username must be 3-50 characters long and contain only letters, numbers, and underscores";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
