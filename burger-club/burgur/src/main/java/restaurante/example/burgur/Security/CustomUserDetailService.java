package restaurante.example.burgur.Security;


import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.UserEntity;
import restaurante.example.burgur.Repository.UserRepository;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // No dependencies beyond UserRepository to avoid circular references


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //Buscar al usuario si no se encuentra traer una excepcion
        //El usuario que se carga es de tipo USer Entity, el que nosotros creamos
       UserEntity userDB = userRepository.findByUsername(username).orElseThrow(
           () -> new UsernameNotFoundException("User not found")
       );
       UserDetails userDetails = new User(userDB.getUsername(),
        userDB.getPassword(),
         mapRolesToAuthorities(userDB.getRoles()));

        //El usuario que se retorna es de tipo UserDetail
        //Se mapean los datos desde el UserEntity a UserDetail
        //Es necesario pasar como tercer parametro grantedAutathorities
       return userDetails;
    }

    //PAsar de roles a GrantedAuthoritys
    private Collection<GrantedAuthority> mapRolesToAuthorities(List<restaurante.example.burgur.Model.Rol> roles) {
        return roles.stream().map(role -> new SimpleGrantedAuthority(role.getName())).collect(Collectors.toList());
    }
    
}
