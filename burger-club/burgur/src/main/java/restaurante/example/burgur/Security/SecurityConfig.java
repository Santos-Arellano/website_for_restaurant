package restaurante.example.burgur.Security;

import java.security.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                /* H2 */
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(requests -> requests
                        /* H2 */
                        .requestMatchers("/h2/**").permitAll()
                        /* Permitir TODAS las rutas de la API temporalmente */
                        .requestMatchers("/api/**").permitAll()
                        /* Permitir todo lo demás */
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}
