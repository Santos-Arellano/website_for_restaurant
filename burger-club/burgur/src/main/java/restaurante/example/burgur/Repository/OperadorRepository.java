package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Operador;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    
}
