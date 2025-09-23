//burger-club/burgur/src/main/java/restaurante/example/burgur/Model/AdicionalesPermiXProducto.java
package restaurante.example.burgur.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
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

}