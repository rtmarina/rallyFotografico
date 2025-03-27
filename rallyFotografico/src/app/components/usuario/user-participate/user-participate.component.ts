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

  constructor(private adminService: AdminServiceService, private router: Router) {}

  registrarUsuario(event: Event) {

    if (!this.terminosCondiciones) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    const usuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.adminService.insertarUser(usuario).subscribe({
      next: (datos) => {
        console.log('Usuario registrado correctamente:', datos);
        alert('Usuario registrado con éxito');
        // Limpiar formulario después del registro
        this.nombre = '';
        this.email = '';
        this.password = '';
        this.terminosCondiciones = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        alert('Hubo un error al registrar el usuario');
      }
    });
  }
}
