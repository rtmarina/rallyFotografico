import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-misfotos',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './user-misfotos.component.html',
  styleUrls: ['./user-misfotos.component.css']
})
export class UserMisfotosComponent {
  imagen64: string = '';
  nombreArchivo: string = '';
  photos: any[] = [];
  currentPage: number = 1;
  usuario: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      this.usuario = JSON.parse(usuarioString);
      this.cargarFotos();
    } else {
      console.warn('No hay usuario logueado en localStorage');
      // Redirigir al login o mostrar un mensaje adecuado
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

    this.userService.registrarImagen(this.usuario.id, this.nombreArchivo, this.imagen64)
      .subscribe({
        next: res => {
          if (res.success) {
            console.log('Imagen subida con éxito:', res);
            alert('Imagen subida con éxito.');
          } else {
            alert('Error al subir la imagen: ' + res.error);
          }
        },
        complete: () => {
          this.cargarFotos();
          this.imagen64 = ''; // Limpiar el campo de imagen
          this.nombreArchivo = ''; // Limpiar el nombre del archivo
        },
        error: err => {
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
    alert('Función eliminar aún no implementada');
  }
}
