# 🍔 Website for Restaurant - Burger Club

Proyecto de restaurante hecho con **Spring Boot + Thymeleaf**.  
Incluye páginas HTML, estilos CSS, scripts JS y recursos de imágenes.

---

## 🚀 Requisitos previos

Antes de correr el proyecto asegúrate de tener instalado:

- [Java 17+](https://adoptium.net/)  
- [Maven 3.8+](https://maven.apache.org/)  
- Git (para clonar el repo)

Verifica con:

```bash
java -version
mvn -version




#▶️ Cómo correr el proyecto

1.Clonar el repositorio:
"""
git clone https://github.com/Santos-Arellano/website_for_restaurant.git
cd website_for_restaurant/burger-club/burgur
"""

2.Compilar y correr con Maven:
"""
mvn spring-boot:run
"""

3.Abrir en tu navegador:
http://localhost:8080
"""


# 🍔 **ESTRUCTURA COMPLETA - CÓDIGO MODULARIZADO BURGER CLUB**

## ✅ **TODOS LOS ARCHIVOS CREADOS**

### 📁 **CSS STRUCTURE (src/main/resources/static/css/)**

```
css/
├── base/
│   ├── variables.css           ✅ CREADO - Variables CSS centralizadas
│   ├── reset.css              ✅ CREADO - Reset CSS y estilos base
│   └── typography.css         ✅ CREADO - Tipografía y textos
├── components/
│   ├── header.css             ✅ CREADO - Header y navegación
│   ├── welcome.css            ✅ CREADO - Sección de bienvenida
│   ├── hero.css               ✅ CREADO - Sección hero con promociones
│   ├── about.css              ✅ CREADO - Sección sobre nosotros
│   ├── menu.css               ✅ CREADO - Sección del menú y filtros
│   ├── footer.css             ✅ CREADO - Footer y redes sociales
│   ├── cart.css               ✅ CREADO - Carrito de compras
│   └── modals.css             ✅ CREADO - Modales y overlays
├── layout/
│   ├── grid.css               ✅ CREADO - Sistema de grids
│   └── mobile.css             ✅ CREADO - Menú móvil
├── utilities/
│   ├── animations.css         📁 USAR EXISTENTE
│   └── responsive.css         📁 USAR EXISTENTE
└── main.css                   ✅ CREADO - Archivo principal que importa todo
```

### 📁 **JAVASCRIPT STRUCTURE (src/main/resources/static/js/)**

```
js/
├── modules/
│   ├── cart/
│   │   ├── CartManager.js     ✅ CREADO - Gestor principal del carrito
│   │   └── cart-ui.js         ✅ CREADO - UI y animaciones del carrito
│   ├── menu/
│   │   ├── menu-filters.js    ✅ CREADO - Filtros de categorías
│   │   ├── menu-grid.js       ✅ CREADO - Grid y paginación
│   │   ├── menu-modals.js     ✅ CREADO - Modales de productos y búsqueda
│   │   └── menu-manager.js    ✅ CREADO - Gestor principal del menú
│   ├── navigation/
│   │   ├── header.js          ✅ CREADO - Gestión del header
│   │   └── mobile-menu.js     ✅ CREADO - Menú móvil
│   └── ui/
│       ├── animations.js      ✅ CREADO - Sistema de animaciones
│       ├── modals.js          ✅ CREADO - Modales de checkout y confirmación
│       └── notifications.js   ✅ CREADO - Sistema de notificaciones
├── utils/
│   ├── helpers.js             ✅ CREADO - Funciones de utilidad
│   └── constants.js           ✅ CREADO - Constantes y configuración
└── app.js                     ✅ CREADO - Archivo principal de la aplicación
```

## 🔧 **CAMBIOS EN LAS PLANTILLAS HTML**

### **index.html y menu.html:**

**ANTES:**
```html
<!-- CSS -->
<link rel="stylesheet" th:href="@{css/styles.css}">
<link rel="stylesheet" th:href="@{css/animations.css}">
<link rel="stylesheet" th:href="@{css/responsive.css}">

<!-- JavaScript -->
<script th:src="@{js/cart.js}" defer></script>
<script th:src="@{js/main.js}" defer></script>
<script th:src="@{js/menu.js}" defer></script>
```

**AHORA:**
```html
<!-- CSS - Solo un archivo -->
<link rel="stylesheet" th:href="@{css/main.css}">

<!-- JavaScript - Solo un archivo -->
<script type="module" th:src="@{js/app.js}" defer></script>