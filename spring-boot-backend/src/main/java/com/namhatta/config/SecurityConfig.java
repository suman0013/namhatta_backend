package com.namhatta.config;

import com.namhatta.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (using JWT, stateless)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Session management (stateless for JWT)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public authentication endpoints
                .requestMatchers("/api/auth/login", "/api/auth/logout", "/api/auth/dev/**").permitAll()
                
                // Public system endpoints
                .requestMatchers("/api/health", "/api/about").permitAll()
                
                // Public geography endpoints
                .requestMatchers(
                    "/api/countries",
                    "/api/states",
                    "/api/districts",
                    "/api/sub-districts",
                    "/api/villages",
                    "/api/pincodes/**",
                    "/api/address-by-pincode"
                ).permitAll()
                
                // Public map endpoints
                .requestMatchers("/api/map/**").permitAll()
                
                // Public namhatta endpoints (GET only)
                .requestMatchers(HttpMethod.GET, "/api/namhattas", "/api/namhattas/**").permitAll()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Security headers
            .headers(headers -> headers
                .contentTypeOptions(contentType -> {})
                .xssProtection(xss -> {})
                .frameOptions(frame -> frame.deny())
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Allowed origins (configure based on environment)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Allowed methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Cache-Control"
        ));
        
        // Max age
        configuration.setMaxAge(86400L); // 24 hours
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
