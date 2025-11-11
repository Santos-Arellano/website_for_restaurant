package restaurante.example.burgur.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Usar BCrypt para almacenar y validar contraseñas de forma segura
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

            .csrf(AbstractHttpConfigurer::disable)
         
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            // Modo stateless: cada request trae su propio JWT, no usamos sesión
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (login, catálogo, H2, recursos estáticos)
                .requestMatchers("/h2/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                // Permitir acceso a recursos estáticos (imágenes)
                .requestMatchers("/images/**", "/Images/**", "/css/**", "/js/**", "/static/**").permitAll()
                // Catálogo visible en lectura pública, escritura solo ADMIN
                .requestMatchers(HttpMethod.GET, "/productos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/productos/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/productos/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/productos/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/adicionales/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/adicionales/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/adicionales/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/adicionales/**").hasAuthority("ADMIN")
                // Rutas para CLIENTE (carrito, pedidos, perfil)
                .requestMatchers("/carrito/**").hasAuthority("CLIENTE")
                .requestMatchers("/pedidos/**").hasAnyAuthority("CLIENTE","OPERADOR","ADMIN")
                .requestMatchers("/user/**").hasAuthority("CLIENTE")
                // Rutas de OPERADOR
                .requestMatchers("/operadores/login").permitAll()
                .requestMatchers("/operadores/current").hasAuthority("OPERADOR")
                .requestMatchers("/domiciliarios/**").hasAnyAuthority("OPERADOR","ADMIN")
                // Rutas de ADMIN
                .requestMatchers("/clientes/**").hasAuthority("ADMIN")
                .requestMatchers("/operadores/**").hasAuthority("ADMIN")
                .requestMatchers("/cupones/**").hasAuthority("ADMIN")
                // Cualquier otra ruta requiere estar autenticado
                .anyRequest().authenticated()
            );

        // Inserto el filtro que valida JWT antes del filtro estándar de usuario/contraseña
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}