package restaurante.example.burgur.Security;

import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:ThisIsADevSecretKeyForJWT1234567890}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:604800000}") // 7 días en milisegundos
    private long jwtExpirationMs;

    public String generateToken(Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();

        // Recojo los roles del usuario autenticado para incluirlos como claim en el token
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // Fechas de emisión y caducidad calculadas según configuración
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Construyo el JWT: subject (username), claim de roles, emisión y expiración
        return Jwts.builder()
                .setSubject(principal.getUsername()) // El subject es el username (correo)
                .claim("roles", authorities)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256) // Firmo con HS256 usando el secreto
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    public String[] getRolesFromJWT(String token) {
        String roles = (String) parseClaims(token).get("roles");
        if (roles == null || roles.isEmpty()) return new String[]{};
        return roles.split(",");
    }

    public boolean validateToken(String token) {
        try {
            // Si el parseo funciona, el token es válido (firma y fechas correctas)
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            // Cualquier error al parsear invalida el token
            return false;
        }
    }

    private Claims parseClaims(String token) {
        // Parser configurado con la misma clave que se usa para firmar
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}