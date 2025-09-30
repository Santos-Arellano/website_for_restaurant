package restaurante.example.burgur.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class AdiXItemCarrito {
    @Id
    @GeneratedValue
    private Long id;

    //Relaciones BDD
    //1). Relación AdiXProdPedido- CarritoItem (Muchos a Uno)
    @ManyToOne
    @JsonIgnore
    private CarritoItem carritoItem;

    //2). Relación AdiXProdPedido- Adicional (Muchos a Uno)
    @ManyToOne
    @JsonIgnore
    private Adicional adicional;

    // Constructor vacio
    public AdiXItemCarrito() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public CarritoItem getCarritoItem() {
        return carritoItem;
    }
    public void setCarritoItem(CarritoItem carritoItem) {
        this.carritoItem = carritoItem;
    }
    public Adicional getAdicional() {
        return adicional;
    }
    public void setAdicional(Adicional adicional) {
        this.adicional = adicional;
    }
    

}
