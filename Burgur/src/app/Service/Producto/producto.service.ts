import { Injectable } from '@angular/core';
import { Producto } from '../../Model/Producto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  constructor() { }
  // Lista de Productos
  productos: Producto[] = [
  {
    id: 1,
    nombre: "Hamburguesa Classic",
    descripcion: "Nuestra hamburguesa tradicional con carne 100% res, perfecta para los amantes de los sabores clásicos",
    precio: 18000,
    categoria: "hamburguesa",
    imgURL: "/images/menu/BURGER.png",
    stock: 25,
    nuevo: true,
    popular: false,
    activo: true,
    ingredientes: ["Carne de res", "Lechuga", "Tomate", "Cebolla", "Pan brioche", "Salsa especial"]
  },
  {
    id: 2,
    nombre: "Hamburguesa BBQ Deluxe",
    descripcion: "Hamburguesa premium con salsa BBQ artesanal y bacon crujiente",
    precio: 25000,
    categoria: "hamburguesa",
    imgURL: "/images/menu/BBQ-especial.png",
    stock: 20,
    nuevo: false,
    popular: true,
    activo: true,
    ingredientes: ["Carne de res", "Bacon", "Queso cheddar", "Salsa BBQ", "Pan artesanal", "Cebolla caramelizada"]
  },
  {
    id: 3,
    nombre: "Hamburguesa Vegetariana",
    descripcion: "Deliciosa hamburguesa vegetal con ingredientes frescos",
    precio: 16000,
    categoria: "hamburguesa",
    imgURL: "/images/menu/veggieburger.png",
    stock: 15,
    nuevo: true,
    popular: false,
    activo: true,
    ingredientes: ["Hamburguesa de lentejas", "Aguacate", "Lechuga", "Tomate", "Pan integral"]
  },
  {
    id: 4,
    nombre: "Perro Caliente Especial",
    descripcion: "Perro caliente gourmet con ingredientes frescos y salsas especiales",
    precio: 12000,
    categoria: "perro caliente",
    imgURL: "/images/menu/hot-dog.png",
    stock: 30,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Salchicha premium", "Pan de perro", "Salsas especiales", "Cebolla", "Pepinillos"]
  },
  {
    id: 5,
    nombre: "Perro Caliente Supremo",
    descripcion: "La versión premium de nuestro perro caliente con todos los adicionales",
    precio: 15000,
    categoria: "perro caliente",
    imgURL: "/images/menu/Hot-Dog-Supreme.png",
    stock: 20,
    nuevo: false,
    popular: true,
    activo: true,
    ingredientes: ["Salchicha premium", "Bacon", "Queso", "Aguacate", "Salsas gourmet"]
  },
  {
    id: 6,
    nombre: "Papas Fritas Grandes",
    descripcion: "Papas fritas crujientes por fuera, suaves por dentro - porción grande",
    precio: 8000,
    categoria: "acompañamiento",
    imgURL: "/images/menu/Fries.png",
    stock: 50,
    nuevo: false,
    popular: true,
    activo: true,
    ingredientes: ["Papas frescas", "Sal marina"]
  },
  {
    id: 7,
    nombre: "Papas Fritas Medianas",
    descripcion: "Papas fritas crujientes - porción mediana",
    precio: 6000,
    categoria: "acompañamiento",
    imgURL: "/images/menu/Fries.png",
    stock: 60,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Papas frescas", "Sal marina"]
  },
  {
    id: 8,
    nombre: "Anillos de Cebolla",
    descripcion: "Crujientes anillos de cebolla empanizados",
    precio: 7000,
    categoria: "acompañamiento",
    imgURL: "/images/menu/aros-cebolla.png",
    stock: 40,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Cebolla", "Empanizado especial", "Aceite de girasol"]
  },
  {
    id: 9,
    nombre: "Coca Cola 350ml",
    descripcion: "Bebida gaseosa refrescante",
    precio: 4000,
    categoria: "bebida",
    imgURL: "/images/menu/Coke.png",
    stock: 100,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Bebida carbonatada"]
  },
  {
    id: 10,
    nombre: "Agua Natural 500ml",
    descripcion: "Agua pura y refrescante",
    precio: 2500,
    categoria: "bebida",
    imgURL: "/images/menu/water.png",
    stock: 80,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Agua natural"]
  },
  {
    id: 11,
    nombre: "Jugo de Naranja Natural",
    descripcion: "Jugo 100% natural de naranja recién exprimida",
    precio: 6000,
    categoria: "bebida",
    imgURL: "/images/menu/orange-juice.png",
    stock: 30,
    nuevo: false,
    popular: false,
    activo: true,
    ingredientes: ["Naranjas naturales"]
  }
];

  findAll(): Producto[] {
    return this.productos;
  }

  findById(id: number): Producto | undefined {
    return this.productos.find(p => p.id === id);
  }


  //CRUD Productos
  //1).Crear
  crearProducto(producto: Producto): void {
    const nextId: number = this.productos.length > 0 ? Math.max(...this.productos.map(p => p.id)) + 1 : 1;
    producto.id = nextId;
    this.productos.push(producto);
  }
  
  //2).Actualizar
  actualizarProducto(id: number, productoActualizado: Producto): void {
    const index = this.productos.findIndex(prod => prod.id === id);
    if (index !== -1) {
      this.productos[index] = { ...this.productos[index], ...productoActualizado };
    }
    else {
      console.error(`Producto con id ${id} no encontrado.`);
    }
  }

  //3).Eliminar
  eliminarProducto(id: number): void {
    const index = this.productos.findIndex(prod => prod.id === id);
    if (index !== -1) {
      this.productos.splice(index, 1);
    }
  }
}
