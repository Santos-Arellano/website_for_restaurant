package restaurante.example.burgur.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class AdiXProdPedido {
    @Id
    @GeneratedValue
    private Long id;
    private int cantidad;
    private float precioUnitario;

    //Relaciones BDD
    //1). Relación AdiXProdPedido- ProdYAdiPedido (Muchos a Uno)
    @ManyToOne
    private ProdYAdiPedido prodYAdiPedido;

    //2). Relación AdiXProdPedido- Adicional (Muchos a Uno)
    @ManyToOne
    private Adicional adicional;

    // Constructor vacio
    public AdiXProdPedido() {
    }

    // Constructor con parametros sin id y sin relaciones BDD
    public AdiXProdPedido(int cantidad, float precioUnitario) {
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public int getCantidad() {
        return cantidad;
    }
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
    public float getPrecioUnitario() {
        return precioUnitario;
    }
    public void setPrecioUnitario(float precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
    public ProdYAdiPedido getProdYAdiPedido() {
        return prodYAdiPedido;
    }
    public void setProdYAdiPedido(ProdYAdiPedido prodYAdiPedido) {
        this.prodYAdiPedido = prodYAdiPedido;
    }
    public Adicional getAdicional() {
        return adicional;
    }
    public void setAdicional(Adicional adicional) {
        this.adicional = adicional;
    }
    

}
