package restaurante.example.burgur.Model;

import jakarta.persistence.*;

@Entity
public class Cupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigo;

    // tipos soportados: PERCENT, FLAT, FREE_SHIPPING
    @Column(nullable = false)
    private String tipo;

    // para PERCENT: porcentaje (0-100); para FLAT: valor en dinero; para FREE_SHIPPING: puede ser 0
    private Double valor;

    private String descripcion;

    private boolean activo = true;

    public Cupon() {}

    public Cupon(Long id, String codigo, String tipo, Double valor, String descripcion, boolean activo) {
        this.id = id;
        this.codigo = codigo;
        this.tipo = tipo;
        this.valor = valor;
        this.descripcion = descripcion;
        this.activo = activo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}