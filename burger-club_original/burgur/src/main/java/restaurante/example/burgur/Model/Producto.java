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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    // Crea los Ingredientes como una tabla auxiliar con (idProducto y nombreIngrediente)
    private List<String> ingredientes = new ArrayList<>();
    
    // Conexiones BDD
    //1). Relación Producto-AdicionalesPermiXProducto (Uno a Muchos)
    @OneToMany(
        mappedBy = "producto",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<AdicionalesPermiXProducto> adicionales = new ArrayList<>();

    //2). Relación Producto-ProdYAdiPedido (Uno a Muchos)
    @OneToMany(
        mappedBy = "producto",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<ProdYAdiPedido> productosYAdicionales = new ArrayList<>();

    //Constructor sin id y sin relaciones BDD
    

    // Método personalizado para verificar stock bajo
    public boolean isStockBajo() {
        return stock != null && stock < 10;
    }
}