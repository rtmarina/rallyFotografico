import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url: string = "http://localhost/rallyFotografico/backend/servicio.php";

  constructor(private http: HttpClient) {}

  iniciarSesion( email: string, password: string ) {
    const payload = {
      servicio: 'iniciarSesion',
      email: email,
      password: password
    };
    return this.http.post(this.url, payload);
  }

  // Guardar imagen Base64 en la base de datos
registrarImagen(usuario_id: number, nombre: string, base64: string): Observable<any> {
  const payload = {
    servicio: 'registrarImagen',
    usuario_id,
    nombre,
    base64
  };
  return this.http.post(this.url, payload);
}

// Obtener imágenes del usuario
listarFotosPorUsuario(usuario_id: number): Observable<any> {
  const payload = {
    servicio: 'listarFotosPorUsuario',
    usuario_id: usuario_id
  };
  return this.http.post(this.url, payload);
}

}
