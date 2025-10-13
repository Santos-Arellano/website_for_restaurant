//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/Cliente.java
package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private String contrasena;
    private String telefono;
    private String direccion;
    private boolean activo;

    //Relaciones BDD
    //1). Relación Cliente- Carrito (1 a muchos)
    @OneToMany(mappedBy = "cliente",
           cascade = {CascadeType.PERSIST, CascadeType.MERGE},
           orphanRemoval = false)
    @JsonIgnore
    private List<Carrito> carritos = new ArrayList<>();

    //Getters y Setters
    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public boolean isActivo() {
        return activo;
    }

    public List<Carrito> getCarritos() {
        return carritos;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public void setCarritos(List<Carrito> carritos) {
        this.carritos = carritos;
    }
    

}