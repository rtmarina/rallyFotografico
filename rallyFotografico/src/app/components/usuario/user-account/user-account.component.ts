import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css'],
  providers: [UserService]
})
export class UserAccountComponent implements OnInit {
  usuario: any = null;
  editar: boolean = false;


  constructor(private router: Router, private userService: UserService) {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    this.usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']); 
  }

  guardarCambios() {
    this.userService.actualizarUsuario(this.usuario).subscribe(res => {
      if (res.success) {
        alert('Datos actualizados correctamente');
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
      } else {
        alert('Error al actualizar: ' + res.error);
      }
    });
  }

  cambiarContrasena() {
    const nueva = prompt("Introduce la nueva contraseña:");
    const confirmar = prompt("Confirma la nueva contraseña:");
  
    if (nueva && confirmar) {
      if (nueva === confirmar) {
        this.usuario.password = nueva;
        this.userService.actualizarUsuario(this.usuario).subscribe(res => {
          if (res.success) {
            alert("Contraseña actualizada correctamente.");
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
          } else {
            alert("Error al actualizar: " + res.error);
          }
        });
      } else {
        alert("Las contraseñas no coinciden.");
      }
    } else {
      alert("Debes rellenar ambos campos.");
    }
  }
  
  eliminarCuenta() {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
  
    if (confirmar) {
      this.userService.eliminarUsuario(this.usuario.id).subscribe(res => {
        if (res.success) {
          alert("Cuenta eliminada correctamente.");
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          alert("Error al eliminar la cuenta: " + res.error);
        }
      });
    }
  }
  
}
