import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = "https://fotorall.wuaze.com/servicio.php";

  constructor(private http: HttpClient) {}

  iniciarSesion( email: string, password: string ) {
    const cuerpo = {
      servicio: 'iniciarSesion',
      email: email,
      password: password
    };
    return this.http.post(this.url, cuerpo);
  }

  actualizarUsuario(usuario: any): Observable<any> {
    const cuerpo: any = {
      servicio: 'actualizarUsuario',
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    };
  
    // Solo incluir la contraseña si está presente (al cambiarla)
    if (usuario.password) {
      cuerpo.password = usuario.password;
    }
  
    return this.http.post(this.url, cuerpo);
  }
  

  eliminarUsuario(id: number): Observable<any> {
    const cuerpo = {
      servicio: 'eliminarUsuario',
      id: id
    };
    return this.http.post(this.url, cuerpo);
  }

  
  

  // Guardar imagen Base64 en la base de datos
registrarImagen(usuario_id: number, nombre: string, base64: string): Observable<any> {
  const cuerpo = {
    servicio: 'registrarImagen',
    usuario_id,
    nombre,
    base64
  };
  return this.http.post(this.url, cuerpo);
}

// Obtener imágenes del usuario
listarFotosPorUsuario(usuario_id: number): Observable<any> {
  const cuerpo = {
    servicio: 'listarFotosPorUsuario',
    usuario_id: usuario_id
  };
  return this.http.post(this.url, cuerpo);
}

eliminarFoto(id: number): Observable<any> {
  const cuerpo = {
    servicio: 'eliminarFoto',
    id: id
  };
  return this.http.post(this.url, cuerpo);
}

actualizarNombreFoto(id: number, nuevoNombre: string): Observable<any> {
  const cuerpo = {
    servicio: 'actualizarNombreFoto',
    id: id,
    nuevoNombre: nuevoNombre
  };
  return this.http.post(this.url, cuerpo);
}

}
