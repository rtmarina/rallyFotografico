import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuarios } from '../models/usuarios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  //mi api
  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  //lista todos los usuarios
  public listarUsers() {
    let cuerpo = JSON.stringify({
      servicio: "listarUsuarios"
    });
    return this.http.post<Usuarios[]>(this.url, cuerpo);
  }

  //elimina un usuario por id
  public eliminarUser(id: number) {
    let cuerpo = JSON.stringify({
      servicio: "eliminarUsuario",
      id: id
    });
    return this.http.post(this.url, cuerpo);
  }

  //inserta un usuario
  insertarUser(usuario: Usuarios) {
    let copia = JSON.parse(JSON.stringify(usuario)); 
    copia.servicio = "crearUsuario";  // Asegúrate de que el servicio esté incluido
  
    console.log("Datos a enviar:", copia); // Verifica el objeto antes de enviarlo
  
    return this.http.post<Usuarios>(this.url, JSON.stringify(copia));
  }
  
  //actualiza un usuario
  public actualizarUser(usuario: Usuarios) {
    let copia = JSON.parse(JSON.stringify(usuario));
    copia.servicio = "actualizarUsuario";
    console.log("Datos a enviar para actualizar:", copia); // Verifica el objeto antes de enviarlo
    
    return this.http.post(this.url, JSON.stringify(copia));
  }
  

}
