package restaurante.example.burgur.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String correo;
    private String contrasena;

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
