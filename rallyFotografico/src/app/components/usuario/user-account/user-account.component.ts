import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css'],
  providers: [UserService]
})
export class UserAccountComponent implements OnInit {
  usuario: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    this.usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']); 
  }
}
