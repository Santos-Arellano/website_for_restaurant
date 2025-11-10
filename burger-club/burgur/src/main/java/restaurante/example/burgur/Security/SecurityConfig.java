package restaurante.example.burgur.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
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
        // Dado que las contraseñas están en texto plano en BD de pruebas
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desactivo CSRF porque trabajamos con JWT en header (sin cookies)
            .csrf(AbstractHttpConfigurer::disable)
            // Permito que la consola H2 funcione en desarrollo
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            // Modo stateless: cada request trae su propio JWT, no usamos sesión
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (login, catálogo, H2)
                .requestMatchers("/h2/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/Images/**").permitAll()
                .requestMatchers("/productos/**").permitAll() // catálogo visible
                .requestMatchers("/adicionales/**").permitAll()
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
