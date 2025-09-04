//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/Adicional.java
package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "adicional")
@NoArgsConstructor
public class Adicional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private double precio;
    private boolean activo = true;

    // Crea las categorías como una tabla auxiliar con (idAdicional y nombreCategoria)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "adicional_categorias",
        joinColumns = @JoinColumn(name = "adicional_id", nullable = false)
    )
    @Column(name = "categoria", nullable = false, length = 50)
    private List<String> categoria = new ArrayList<>();

    // Relación con productos (lazy loading para evitar problemas de rendimiento)
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
        this.categoria = new ArrayList<>();
        this.activo = true;
        this.nombre = nombre;
        this.precio = precio;
        this.activo = activo;
        this.categoria = categoria != null ? new ArrayList<>(categoria) : new ArrayList<>();
    }

    // Constructor con validaciones
    public Adicional(String nombre, double precio, List<String> categoria) {
        this.categoria = new ArrayList<>();
        this.activo = true;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria != null ? new ArrayList<>(categoria) : new ArrayList<>();
    }

    // Getters y Setters con validaciones
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
        this.nombre = nombre != null ? nombre.trim() : null; 
    }

    public double getPrecio() { 
        return precio; 
    }
    
    public void setPrecio(double precio) { 
        this.precio = Math.max(0, precio); // Asegurar precio no negativo
    }

    public boolean isActivo() { 
        return activo; 
    }
    
    public void setActivo(boolean activo) { 
        this.activo = activo; 
    }

    public List<String> getCategoria() { 
        if (categoria == null) {
            categoria = new ArrayList<>();
        }
        return categoria;
    }
    
    public void setCategoria(List<String> categoria) { 
        if (categoria == null) {
            this.categoria = new ArrayList<>();
        } else {
            this.categoria = new ArrayList<>();
            for (String cat : categoria) {
                if (cat != null && !cat.trim().isEmpty()) {
                    this.categoria.add(cat.trim().toLowerCase());
                }
            }
        }
    }

    @JsonIgnore
    public List<AdicionalesPermiXProducto> getProductos() { 
        if (productos == null) {
            productos = new ArrayList<>();
        }
        return productos; 
    }
    
    public void setProductos(List<AdicionalesPermiXProducto> productos) { 
        this.productos = productos != null ? productos : new ArrayList<>(); 
    }

    // Métodos de utilidad
    @JsonIgnore
    public boolean hasCategoria(String categoria) {
        if (categoria == null || categoria.trim().isEmpty()) {
            return false;
        }
        return this.getCategoria().contains(categoria.trim().toLowerCase());
    }

    public void addCategoria(String categoria) {
        if (categoria != null && !categoria.trim().isEmpty()) {
            String normalizedCat = categoria.trim().toLowerCase();
            if (!this.getCategoria().contains(normalizedCat)) {
                this.getCategoria().add(normalizedCat);
            }
        }
    }

    public void removeCategoria(String categoria) {
        if (categoria != null && !categoria.trim().isEmpty()) {
            this.getCategoria().remove(categoria.trim().toLowerCase());
        }
    }

    @JsonIgnore
    public boolean isValidForPersistence() {
        return nombre != null && !nombre.trim().isEmpty() && 
               precio > 0 && 
               categoria != null && !categoria.isEmpty();
    }

    // Método toString para debugging
    @Override
    public String toString() {
        return "Adicional{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", precio=" + precio +
                ", activo=" + activo +
                ", categoria=" + categoria +
                '}';
    }

    // Métodos equals y hashCode basados en nombre (para evitar duplicados)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        Adicional adicional = (Adicional) o;
        return nombre != null ? nombre.equalsIgnoreCase(adicional.nombre) : adicional.nombre == null;
    }

    @Override
    public int hashCode() {
        return nombre != null ? nombre.toLowerCase().hashCode() : 0;
    }
}