//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/AdicionalesPermiXProducto.java
package restaurante.example.burgur.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class AdicionalesPermiXProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;
    
    @ManyToOne
    @JoinColumn(name = "adicional_id")
    private Adicional adicional;
    
    // Constructor completo
    public AdicionalesPermiXProducto(Producto producto, Adicional adicional) {
        this.producto = producto;
        this.adicional = adicional;
    }
    
    // Constructor vacío (requerido por JPA)
    public AdicionalesPermiXProducto() {}
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    
    public Adicional getAdicional() { return adicional; }
    public void setAdicional(Adicional adicional) { this.adicional = adicional; }
}