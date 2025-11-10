package restaurante.example.burgur.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir recursos estáticos desde classpath:/static/Images/ para ambas rutas
        registry.addResourceHandler("/Images/**")
                .addResourceLocations("classpath:/static/Images/");

        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/Images/");
    }
}