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
    //1). Relación Pedido - Cliente (1 a muchos)
    @OneToMany(mappedBy = "cliente",
           cascade = {CascadeType.PERSIST, CascadeType.MERGE},
           orphanRemoval = false)
    private List<Pedido> pedidos = new ArrayList<>();

    

}