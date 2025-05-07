import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminServiceService } from '../../../services/admin-service.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user-participate',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [AdminServiceService],
  templateUrl: './user-participate.component.html',
  styleUrls: ['./user-participate.component.css']
})
export class UserParticipateComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  terminosCondiciones: boolean = false;
  formularioEnviado: boolean = false;
  emailExiste: boolean = false;

  constructor(private adminService: AdminServiceService, private router: Router) {}

  registrarUsuario(event: Event) {
    event.preventDefault(); // importante para evitar recarga
  
    this.formularioEnviado = true;
  
    // Verificar si todos los campos están completos
    if (!this.nombre || !this.email || !this.password || !this.terminosCondiciones) {
      alert('Por favor, completa todos los campos y acepta los términos y condiciones');
      return; // Detener ejecución si faltan campos
    }
  
    // Si los campos están completos, continuamos con la creación del usuario
    const usuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };
  
    console.log('Datos enviados:', usuario); // Agregar esta línea
  
    // Llamada al servicio para insertar el usuario
    this.adminService.insertarUser(usuario).subscribe({
      next: (datos) => {
        console.log('Usuario registrado correctamente:', datos);
        alert('Usuario registrado con éxito');
        this.nombre = '';
        this.email = '';
        this.password = '';
        this.terminosCondiciones = false;
        this.formularioEnviado = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        if (error.error && error.error.error === 'El email ya está registrado') {
          this.emailExiste = true;  // Asignar una bandera para mostrar el error en el frontend
        } else {
          alert('Hubo un error al registrar el usuario');
        }
      }
    });
  }
  
  

  
  validarEmail(email: string): boolean {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(email);
  }
  
}