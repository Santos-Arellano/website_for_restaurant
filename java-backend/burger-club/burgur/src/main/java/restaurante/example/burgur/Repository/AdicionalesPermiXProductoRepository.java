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

    @Query("SELECT ap.adicional FROM AdicionalesPermiXProducto ap WHERE ap.producto.id = :productoId")
    List<Adicional> findAdicionalesByProductoId(@Param("productoId") Long productoId);
}