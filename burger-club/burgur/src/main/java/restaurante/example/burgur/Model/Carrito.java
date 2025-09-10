package restaurante.example.burgur.Model;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Carrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Relaciones BDD
    //1). Relación Pedido-Carrito (Uno a Uno)
    @OneToOne 
    @JoinColumn(name = "pedido_id", unique = true, nullable = true)
    private Pedido pedido;

}
