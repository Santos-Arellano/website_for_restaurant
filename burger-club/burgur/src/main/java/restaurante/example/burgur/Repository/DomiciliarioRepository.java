package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import restaurante.example.burgur.Model.Domiciliario;

@Repository
public interface DomiciliarioRepository extends JpaRepository<Domiciliario, Long> {

    java.util.List<Domiciliario> findByOperadorId(Long operadorId);

    @Modifying
    @Transactional
    @Query("UPDATE Domiciliario d SET d.operador = null WHERE d.operador.id = :operadorId")
    void clearOperadorByOperadorId(@Param("operadorId") Long operadorId);
}
