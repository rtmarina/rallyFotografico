import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url: string = "http://localhost/FCT/rallyFotografico/backend/servicio.php";

  constructor(private http: HttpClient) {}

  iniciarSesion( email: string, password: string ) {
    const payload = {
      servicio: 'iniciarSesion',
      email: email,
      password: password
    };
    return this.http.post(this.url, payload);
  }
}
