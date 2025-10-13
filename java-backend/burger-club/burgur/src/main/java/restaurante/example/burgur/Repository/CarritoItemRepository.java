package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.CarritoItem;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    
}
