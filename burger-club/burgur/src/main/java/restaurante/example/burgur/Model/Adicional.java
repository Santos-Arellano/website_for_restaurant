//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/Adicional.java
package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Adicional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private double precio;
    private boolean activo;

    // 🔑 Para que Hibernate/JPA entienda cómo guardar esta lista de Strings
    @ElementCollection
    private List<String> categoria = new ArrayList<>();

    // Conexiones BDD
    @OneToMany(
        mappedBy = "adicional",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<AdicionalesPermiXProducto> productos = new ArrayList<>();

    // Constructor completo
    public Adicional(String nombre, double precio, boolean activo, List<String> categoria) {
        this.nombre = nombre;
        this.precio = precio;
        this.activo = activo;
        this.categoria = categoria;
    }

    // Constructor vacío (requerido por JPA)
    public Adicional() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public List<String> getCategoria() { return categoria; }
    public void setCategoria(List<String> categoria) { this.categoria = categoria; }

    public List<AdicionalesPermiXProducto> getProductos() { return productos; }
    public void setProductos(List<AdicionalesPermiXProducto> productos) { this.productos = productos; }
}
