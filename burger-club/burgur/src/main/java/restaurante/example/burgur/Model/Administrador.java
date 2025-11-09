package restaurante.example.burgur.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;

@Entity
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String correo;
    private String contrasena;

    //1). Relación Administrador- UserEntity (1 a 1)
    @OneToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    private UserEntity user;

    //Constructor vacio
    public Administrador() {
    }
    //Constructor con parametros sin id y sin relaciones de BDD
    public Administrador(String correo, String contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }

    //Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    public String getContrasena() {
        return contrasena;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
