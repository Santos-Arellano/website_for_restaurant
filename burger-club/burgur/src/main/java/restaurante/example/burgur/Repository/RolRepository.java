package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import restaurante.example.burgur.Model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Rol findByName(String name);
    
}
