package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Operador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String cedula;
    private boolean disponible;

    //Relaciones BDD
    //1). Relación Domiciliario - Operador (1 a muchos)
    @OneToMany(mappedBy = "operador", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private List<Domiciliario> domiciliarios = new ArrayList<>();

    //2). Relación Pedido - Operador (1 a muchos)
    @OneToMany(mappedBy = "operador", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private List<Pedido> pedidos = new ArrayList<>();

    //Constructor vacio
    public Operador() {
    }

    //Constructor con parametros sin id y sin relaciones BDD
    public Operador(String nombre, String cedula, boolean disponible) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.disponible = disponible;
    }

    //Getters and Setters
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

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public List<Domiciliario> getDomiciliarios() {
        return domiciliarios;
    }

    public void setDomiciliarios(List<Domiciliario> domiciliarios) {
        this.domiciliarios = domiciliarios;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }

    public void setPedidos(List<Pedido> pedidos) {
        this.pedidos = pedidos;
    }

    
    
}
