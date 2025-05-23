import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-misfotos',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './user-misfotos.component.html',
  styleUrls: ['./user-misfotos.component.css']
})
export class UserMisfotosComponent {
  imagen64: string = '';
  nombreArchivo: string = '';
  photos: any[] = [];
  currentPage: number = 1;
  usuario: any = null;
  logueado: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const usuarioString = localStorage.getItem('usuario');
  if (usuarioString) {
    this.usuario = JSON.parse(usuarioString);
    this.logueado = true;
    this.cargarFotos();
  } else {
    this.logueado = false;
  }
  }

  leerImagen(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) {
      console.error('No se ha seleccionado un archivo');
      return;
    }
    
    this.nombreArchivo = archivo.name;

    const lector = new FileReader();
    lector.onload = () => {
      this.imagen64 = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  subirArchivo() {
  if (!this.usuario || !this.imagen64 || !this.nombreArchivo) {
    alert('Por favor selecciona una imagen antes de continuar.');
    return;
  }

  // Calcular el tamaño real en bytes de la imagen base64
  // Elimina el prefijo "data:image/xxx;base64," si existe
  const base64String = this.imagen64.includes(',') ? this.imagen64.split(',')[1] : this.imagen64;
  
  // Calcula el tamaño aproximado en bytes
  const padding = (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
  const sizeInBytes = (base64String.length * 3) / 4 - padding;

  const maxSizeInBytes = 1 * 1024 * 1024; // 10MB
  if (sizeInBytes > maxSizeInBytes) {
    alert('La imagen supera el límite de 1MB. Por favor elige otra.');
    return;
  }

  this.userService.registrarImagen(this.usuario.id, this.nombreArchivo, this.imagen64)
    .subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('Imagen subida con éxito:', res);
          alert('Imagen subida con éxito.');
        } else {
          console.error('Error al subir la imagen:', res.error);
          alert('Error al subir la imagen: ' + res.error);
        }
      },
      complete: () => {
        this.cargarFotos();
        this.imagen64 = '';
        this.nombreArchivo = '';
      },
      error: (err: any) => {
        console.error('Error al subir imagen:', err);
        alert('Hubo un error al subir la imagen.');
      }
    });
}


  

  cargarFotos() {
    if (!this.usuario) {
      console.warn('Usuario no encontrado para cargar fotos.');
      return;
    }

    this.userService.listarFotosPorUsuario(this.usuario.id)
      .subscribe({
        next: (res: any) => {
          if (res && Array.isArray(res)) {
            this.photos = res.map((img: any) => ({
              id: img.id,
              nombre: img.nombre,
              url: img.base64 || `data:image/jpeg;base64,${img.imagen}` // dependiendo del nombre en PHP
            }));
          } else {
            console.warn('No se encontraron fotos para este usuario.');
          }
        },
        error: err => {
          console.error('Error al cargar fotos:', err);
          alert('Hubo un error al cargar las fotos.');
        }
      });
  }

  deletePhoto(id: number, url: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;
  
    this.userService.eliminarFoto(id).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Foto eliminada correctamente');
          this.cargarFotos(); // Actualiza la lista
        } else {
          alert('Error al eliminar la foto: ' + res.error);
        }
      },
      error: (err) => {
        console.error('Error al eliminar la foto:', err);
        alert('Hubo un error al eliminar la foto');
      }
    });
  }

  editarNombre(photo: any) {
    photo.editando = true;
    photo.nuevoNombre = photo.nombre;
  }
  
  cancelarEdicion(photo: any) {
    photo.editando = false;
  }
  
  guardarNombre(photo: any) {
    if (!photo.nuevoNombre || photo.nuevoNombre.trim() === '') {
      alert('El nuevo nombre no puede estar vacío.');
      return;
    }
  
    this.userService.actualizarNombreFoto(photo.id, photo.nuevoNombre)
      .subscribe({
        next: res => {
          if (res.success) {
            photo.nombre = photo.nuevoNombre;
            photo.editando = false;
            alert('Nombre actualizado con éxito.');
          } else {
            alert('Error al actualizar el nombre: ' + res.error);
          }
        },
        error: err => {
          console.error('Error al actualizar el nombre:', err);
          alert('Hubo un error al actualizar el nombre');
        }
      });
  }
  
  
}
