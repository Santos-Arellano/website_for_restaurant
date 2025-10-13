package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Domiciliario;

@Repository
public interface DomiciliarioRepository extends JpaRepository<Domiciliario, Long> {

}
