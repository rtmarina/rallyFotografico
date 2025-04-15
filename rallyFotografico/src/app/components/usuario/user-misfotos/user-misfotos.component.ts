import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router'; // Para navegar
import { UserService } from '../../../services/user.service';
 // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-user-misfotos',
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './user-misfotos.component.html',
  styleUrls: ['./user-misfotos.component.css']
})
export class UserMisfotosComponent {
  photos: any[] = []; // Lista dinámica de fotos cargadas desde el backend
  currentPage = 1;
  fImagen: File | null = null; // Archivo seleccionado
  inputFile: any = null; // Referencia al campo de archivo
  imagen64: string = ""; // Contenido en Base64 para previsualización (opcional)
  url = "http://localhost/FCT/rallyFotografico/backend/servicio.php"; // URL del backend
  isLoading: boolean = false; // Estado de carga
  terminosCondiciones: boolean = false; // Propiedad para almacenar el estado de aceptación de términos y condiciones
  nombreImagen: string = '';  // Para almacenar el nombre de la imagen
  usuarioId: number = 1; // Asegúrate de asignar el usuarioId desde donde corresponda

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const datosUsuario = JSON.parse(usuario);
      this.usuarioId = datosUsuario.id;
    }
    this.cargarImagenes();
  }
  

  // Método para cargar imágenes desde el backend
  async cargarImagenes() {
    this.isLoading = true; // Mostrar indicador de carga
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
    } finally {
      this.isLoading = false; // Ocultar indicador de carga
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
      const datos = await respuesta.json();
      const photo = this.photos.find(p => p.id === photoId);
      if (photo) {
        photo.likes = datos.nuevosLikes; // Usar el valor actualizado desde el backend
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
      alert("Por favor, selecciona un archivo.");
      return;
    }
  
    const formData = new FormData();
    formData.append("peticion", "crearArchivo");
    formData.append("archivo", this.fImagen);
  
    try {
      const resultado = await fetch(this.url, {
        method: 'POST',
        body: formData
      });
  
      if (resultado.ok) {
        const datos = await resultado.json();
        console.log("Archivo subido correctamente:", datos);
  
        // Después de subir el archivo, registramos en la BD
        const imagen = {
          usuario_id: this.usuarioId,
          nombre: this.fImagen.name, // Usa el nombre real del archivo
          imagen_base64: this.imagen64
        };
  
        this.userService.insertarImagen(imagen).subscribe({
          next: (res) => {
            console.log('Imagen registrada en la base de datos:', res);
            alert("Imagen subida y registrada con éxito");
            this.cargarImagenes();
          },
          error: (err) => {
            console.error("Error al registrar en la base de datos", err);
            alert("Error al registrar la imagen en la base de datos");
          }
        });
  
        this.inputFile.value = null;
        this.fImagen = null;
        this.imagen64 = "";
  
      } else {
        alert("Hubo un error al subir el archivo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al subir el archivo.");
    }
  }
  

  // Método para eliminar una foto desde el backend
  async deletePhoto(photoId: number, photoUrl: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) return;

    // Extraer solo el nombre del archivo
    const fileName = photoUrl.split('/').pop();

    if (!fileName) {
      console.error('Error al obtener el nombre del archivo.');
      return;
    }

    const urlToDelete = `${this.url}?peticion=eliminarArchivo&archivo=${fileName}`;

    const parametros = {
      method: 'DELETE',
    };

    try {
      this.isLoading = true; // Mostrar indicador de carga
      const respuesta = await fetch(urlToDelete, parametros);

      if (respuesta.ok) {
        console.log(`Foto eliminada con éxito: ${fileName}`);

        // Eliminar la foto de la lista para actualizar la interfaz
        this.photos = this.photos.filter(photo => photo.id !== photoId);

        alert('Foto eliminada correctamente');
      } else {
        console.error('Error al eliminar la foto:', await respuesta.text());
        alert('Error al eliminar la foto.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Hubo un error al eliminar la foto.');
    } finally {
      this.isLoading = false; // Ocultar indicador de carga
    }
  }

  // Método para registrar la imagen
  registrarImagen(event: Event) {
    if (!this.terminosCondiciones) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    // Crear un objeto con los datos de la imagen
    const imagen = {
      usuario_id: this.usuarioId,  // Asegúrate de asignar correctamente el usuarioId
      nombre: this.nombreImagen,  // Asegúrate de que el nombre esté bien asignado
      imagen_base64: this.imagen64,  // La imagen en Base64
    };

    // Llamar al servicio para insertar la imagen
    this.userService.insertarImagen(imagen).subscribe({
      next: (datos) => {
        console.log('Imagen registrada correctamente:', datos);
        alert('Imagen registrada con éxito');
        // Limpiar los campos después del registro
        this.nombreImagen = '';
        this.imagen64 = '';
        this.terminosCondiciones = false;
        this.router.navigate(['/']);  // Navegar a la página principal
      },
      error: (error) => {
        console.error('Error al registrar la imagen:', error);
        alert('Hubo un error al registrar la imagen');
      }
    });
  }
}
