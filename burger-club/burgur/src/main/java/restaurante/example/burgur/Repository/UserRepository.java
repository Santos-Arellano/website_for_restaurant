package restaurante.example.burgur.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import restaurante.example.burgur.Model.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Boolean existsByUsername(String username);
}