package restaurante.example.burgur.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.AdicionalesPermiXProducto;

public interface AdicionalesPermiXProductoRepository extends JpaRepository<AdicionalesPermiXProducto, Long> {
    // ==========================================
    // MÉTODOS DE FILTRADO
    // ==========================================
    // Devuelve directamente los Adicional del producto
    @Query("""
            select a
            from AdicionalesPermiXProducto ap
            join ap.adicional a
            where ap.producto.id = :productoId
            """)
    List<Adicional> findAdicionalesByProductoId(@Param("productoId") Long productoId);
        
}
