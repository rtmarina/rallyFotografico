import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule
import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],  // Agrega HttpClientModule aquí
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
  providers: [UserService]
})
export class UserLoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private userService: UserService, private router: Router) {}

  iniciarSesion() {
    this.userService.iniciarSesion(this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Respuesta del servidor:', res);
        console.log('Tipo de respuesta:', typeof res);
  
        // Si llega como string, parseamos manualmente
        if (typeof res === 'string') {
          try {
            res = JSON.parse(res);
          } catch (e) {
            console.error('Error al parsear JSON:', e);
            this.error = 'Respuesta no válida del servidor.';
            return;
          }
        }
  
        if (res.success) {
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.router.navigate(['/account']);
        } else {
          this.error = res.error || 'Error desconocido al iniciar sesión.';
        }
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);
        this.error = 'No se pudo conectar con el servidor.';
      }
    });
  }
  
}
