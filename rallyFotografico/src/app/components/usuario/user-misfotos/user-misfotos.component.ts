import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-user-misfotos',
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './user-misfotos.component.html',
  styleUrl: './user-misfotos.component.css'
})
export class UserMisfotosComponent {
  photos: any[] = []; // Lista dinámica de fotos cargadas desde el backend
  currentPage = 1;
  fImagen: File | null = null; // Archivo seleccionado
  inputFile: any = null; // Referencia al campo de archivo
  imagen64: string = ""; // Contenido en Base64 para previsualización (opcional)
  url = "http://localhost/FCT/rallyFotografico/backend/servicio.php"; // URL del backend

  constructor() { }

  ngOnInit() {
    this.cargarImagenes(); // Cargar imágenes al iniciar el componente
  }

  // Método para cargar imágenes desde el backend
  async cargarImagenes() {
    try {
      const respuesta = await fetch(`${this.url}?peticion=listarArchivos`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log('Imágenes recibidas:', datos);
        // Transformar datos en un array compatible con photos
        this.photos = datos.imagenes.map((imagen: string, index: number) => ({
          id: index + 1, // Asignar un ID único
          url: `http://localhost/FCT/rallyFotografico/backend/imagenes/${imagen}`, // URL completa de la imagen
          likes: 0 // Inicializar con 0 likes
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
    const parametros = {
      method: 'POST',
      body: JSON.stringify({ servicio: 'actualizarLikes', id: photoId }),
      headers: { 'Content-Type': 'application/json' }
    };
  
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
  }
  

  // Método para leer y previsualizar la imagen seleccionada
  leerImagen(event: Event) {
    this.inputFile = event.target;
    this.fImagen = (event.target as HTMLInputElement).files![0];
    console.log("fImagen: ", this.fImagen);

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('contenido: ', reader.result);
      this.imagen64 = reader.result as string; // Guardar contenido en Base64 (opcional)
    };
    reader.readAsDataURL(this.fImagen);
  }

  // Método para subir un archivo al backend
  async subirArchivo() {
    if (!this.fImagen) {
      console.log("No hay archivo seleccionado");
      alert("Por favor, selecciona un archivo.");
      return;
    }
    console.log("Subiendo archivo...");

    const formData = new FormData();
    formData.append("peticion", "crearArchivo");
    formData.append("archivo", this.fImagen);

    const parametros = {
      method: 'POST',
      body: formData
    };
    console.log("parametros: ", parametros);

    // Realizar la solicitud al backend
    const resultado = await fetch(this.url, parametros);
    console.log("resultado: ", resultado);
    if (resultado.ok) {
      const datos = await resultado.json();
      console.log("Archivo subido correctamente:", datos);
      alert("Archivo subido correctamente");
      // Restablecer valores del input file
      this.inputFile.value = null;
      this.fImagen = null;
      this.imagen64 = "";

      // Recargar las imágenes después de subir el archivo
      this.cargarImagenes();
    } else {
      console.error("Error al subir archivo:", resultado);
      alert("Hubo un error al subir el archivo.");
    }
  }
}
