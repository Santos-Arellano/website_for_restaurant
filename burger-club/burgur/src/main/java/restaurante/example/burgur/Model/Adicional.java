package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Adicional {
    @Id
    @GeneratedValue
    private Long id;
    private String nombre;
    private double precio;
    private boolean activo;
    private List<String> categoria; // Mismas categorias de los productos con eso se hace el match
    //private String imgURL;

    //Conexiones BDD
     @OneToMany(
        mappedBy = "adicional",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<AdicionalesPermiXProducto> productos = new ArrayList<>();

    // Constructor sin id y sin conexiones BDD
    public Adicional(String nombre, double precio, boolean activo, List<String> categoria) {
        this.nombre = nombre;
        this.precio = precio;
        this.activo = activo;
        this.categoria = categoria;
    }

    // Constructor sin parámetros
    public Adicional() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public List<String> getCategoria() {
        return categoria;
    }

    public void setCategoria(List<String> categoria) {
        this.categoria = categoria;
    }

    public List<AdicionalesPermiXProducto> getProductos() {
        return productos;
    }

    public void setProductos(List<AdicionalesPermiXProducto> productos) {
        this.productos = productos;
    }

    
    

}
