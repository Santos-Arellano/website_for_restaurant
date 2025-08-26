//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/Producto.java
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
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    private double precio;
    private String categoria;
    private String imgURL;
    private Integer stock;
    private boolean nuevo;
    private boolean popular;
    private boolean activo;
    
    @ElementCollection
    private List<String> ingredientes = new ArrayList<>();
    
    // Conexiones BDD
    @OneToMany(
        mappedBy = "producto",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<AdicionalesPermiXProducto> adicionales = new ArrayList<>();
    
    // Constructor completo
    public Producto(String nombre, String descripcion, double precio, String categoria,
                    String imgURL, Integer stock, boolean nuevo, boolean popular, 
                    boolean activo, List<String> ingredientes) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.imgURL = imgURL;
        this.stock = stock;
        this.nuevo = nuevo;
        this.popular = popular;
        this.activo = activo;
        this.ingredientes = ingredientes;
    }
    
    // Constructor vacío (requerido por JPA)
    public Producto() {}
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public String getImgURL() { return imgURL; }
    public void setImgURL(String imgURL) { this.imgURL = imgURL; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public boolean isNuevo() { return nuevo; }
    public void setNuevo(boolean nuevo) { this.nuevo = nuevo; }
    
    public boolean isPopular() { return popular; }
    public void setPopular(boolean popular) { this.popular = popular; }
    
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    
    public List<String> getIngredientes() { return ingredientes; }
    public void setIngredientes(List<String> ingredientes) { this.ingredientes = ingredientes; }
    
    public List<AdicionalesPermiXProducto> getAdicionales() { return adicionales; }
    public void setAdicionales(List<AdicionalesPermiXProducto> adicionales) { this.adicionales = adicionales; }
    
    // Métodos helper
    public boolean isStockBajo() {
        return stock != null && stock < 5;
    }
}