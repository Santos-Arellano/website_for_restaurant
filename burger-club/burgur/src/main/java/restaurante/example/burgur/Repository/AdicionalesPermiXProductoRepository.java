//burger-club/burgur/src/main/java/restaurante/example/burgur/Repository/AdicionalesPermiXProductoRepository.java
package restaurante.example.burgur.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.AdicionalesPermiXProducto;

@Repository
public interface AdicionalesPermiXProductoRepository extends JpaRepository<AdicionalesPermiXProducto, Long> {
    
    @Query("""
            select a
            from AdicionalesPermiXProducto ap
            join ap.adicional a
            where ap.producto.id = :productoId
            """)
    List<Adicional> findAdicionalesByProductoId(@Param("productoId") Long productoId);
}