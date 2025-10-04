package com.namhatta.security;

import com.namhatta.model.entity.User;
import com.namhatta.model.enums.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class CustomUserDetails implements UserDetails {
    
    private final Long userId;
    private final String username;
    private final String password;
    private final UserRole role;
    private final List<String> districts;
    private final boolean isActive;
    
    public CustomUserDetails(User user, List<String> districts) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.districts = districts;
        this.isActive = user.getIsActive();
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public UserRole getUserRole() {
        return role;
    }
    
    public List<String> getDistricts() {
        return districts;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
