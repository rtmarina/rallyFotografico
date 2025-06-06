import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-gallery',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './user-gallery.component.html',
  styleUrls: ['./user-gallery.component.css']
})
export class UserGalleryComponent {
  photos: any[] = []; // Lista dinámica de fotos cargadas desde el backend
  currentPage = 1; // Página actual para la paginación
  url = environment.apiUrl; // URL del backend
  usuarioLogueado: boolean = false;
  constructor() {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    this.usuarioLogueado = !!usuario; // Convierte a true si existe usuario
    this.cargarImagenes(); 
    // Cargar imágenes al iniciar el componente
  }



  // Método para cargar imágenes desde el backend
  async cargarImagenes() {
    try {
      const respuesta = await fetch(`${this.url}?peticion=listarArchivos`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log('Imágenes recibidas:', datos);

        // Mapear las imágenes Base64 recibidas
        this.photos = datos.imagenes.map((imagen: any) => ({
          id: imagen.id,
          nombre: imagen.nombre,
          url: imagen.base64, // Imagen como Base64 directamente
          likes: imagen.likes // Inicializar con 0 likes o puedes traerlo del backend si está
        }));
      } else {
        console.error('Error al cargar las imágenes:', respuesta.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }

  // Método para incrementar los likes de una foto
  async likePhoto(photoId: number) {
  if (!this.usuarioLogueado) {
    alert('Debes iniciar sesión para poder votar.');
    return;
  }

  const parametros = {
    method: 'POST',
    body: JSON.stringify({ servicio: 'actualizarLikes', id: photoId }),
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    const respuesta = await fetch(this.url, parametros);
    if (respuesta.ok) {
      console.log(`Likes actualizados para la foto ${photoId}`);
      const photo = this.photos.find(p => p.id === photoId);
      if (photo) {
        photo.likes++;
      }
    } else {
      console.error('Error al actualizar likes');
    }
  } catch (error) {
    console.error('Error en la solicitud de likes:', error);
  }
}

}
