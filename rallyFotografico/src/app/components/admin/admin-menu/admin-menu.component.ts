import { Component, OnInit } from '@angular/core';
import { AdminServiceService } from '../../../services/admin-service.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {
nombreAdmin: string = '';
  constructor(private userService: UserService) {
    
  }
  ngOnInit() {
    this.cargarNombreUsuario();
  }

cargarNombreUsuario() {
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (usuarioLocal && usuarioLocal.id) {
    const id = usuarioLocal.id;

    this.userService.getUsuario(id).subscribe({
      next: (usuarioActualizado) => {
        const nombreUsuario = usuarioActualizado.nombre || 'Usuario';
        localStorage.setItem('nombre', JSON.stringify(nombreUsuario));
        this.nombreAdmin = nombreUsuario; // Actualiza la variable en el componente
      },
      error: (err) => {
        console.error('Error al cargar el nombre del usuario:', err);
      }
    });
  } else {
    console.warn('No se encontró un usuario válido en localStorage');
  }
}

}

