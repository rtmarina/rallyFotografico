import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-participate',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-participate.component.html',
  styleUrls: ['./user-participate.component.css']
})
export class UserParticipateComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  terminosCondiciones: boolean = false;

  url = "http://localhost/FCT/rallyFotografico/backend/servicio.php"; // URL del backend

  constructor() {}

  // Método para registrar un nuevo usuario
  async registrarUsuario(event: Event) {
    event.preventDefault();

    if (!this.terminosCondiciones) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    const usuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    const parametros = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    };

    try {
      const respuesta = await fetch(`${this.url}?peticion=registrarUsuario`, parametros);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log('Usuario registrado correctamente:', datos);
        alert('Usuario registrado con éxito');
        // Limpiar formulario después del registro
        this.nombre = '';
        this.email = '';
        this.password = '';
        this.terminosCondiciones = false;
      } else {
        const error = await respuesta.json();
        console.error('Error al registrar usuario:', error);
        alert('Hubo un error al registrar el usuario');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Hubo un error al procesar el formulario');
    }
  }
}
