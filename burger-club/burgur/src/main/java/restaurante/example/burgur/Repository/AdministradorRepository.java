package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import restaurante.example.burgur.Model.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    
}
