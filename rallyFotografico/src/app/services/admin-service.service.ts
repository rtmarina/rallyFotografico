import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuarios } from '../models/usuarios';


@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private url: string = "http://localhost/FCT/rallyFotografico/backend/servicio.php";

  constructor(private http: HttpClient) { }

  public listarUsers() {
    let cuerpo = JSON.stringify({
      servicio: "listarUsuarios"
    });
    return this.http.post<Usuarios[]>(this.url, cuerpo);
  }

  public eliminarUser(id: number) {
    let cuerpo = JSON.stringify({
      servicio: "borrarUsuario",
      id: id
    });
    return this.http.post(this.url, cuerpo);
  }

  public insertarUser(usuario: Usuarios) {
    let copia = JSON.parse(JSON.stringify(usuario));
    copia.servicio = "crearUsuario";
  
    return this.http.post<Usuarios>(this.url, JSON.stringify(copia));
  }

}
