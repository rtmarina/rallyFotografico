import { Routes } from '@angular/router';
import { UserMenuComponent } from './components/usuario/user-menu/user-menu.component';
import { UserInfoComponent } from './components/usuario/user-info/user-info.component';
import { UserGalleryComponent } from './components/usuario/user-gallery/user-gallery.component';
import { UserParticipateComponent } from './components/usuario/user-participate/user-participate.component';
import { UserLoginComponent } from './components/usuario/user-login/user-login.component';
import { UserMisfotosComponent } from './components/usuario/user-misfotos/user-misfotos.component';
import { AdminGalleryComponent } from './components/admin/admin-gallery/admin-gallery.component';
import { AdminMenuComponent } from './components/admin/admin-menu/admin-menu.component';
import { AdminValidationComponent } from './components/admin/admin-validation/admin-validation.component';
import { AdminUsuariosComponent } from './components/admin/admin-usuarios/admin-usuarios.component';

export const routes: Routes = [
    {
        path: '', component: UserMenuComponent
    },
    {
        path: 'informacion', component: UserInfoComponent
    },
    {
        path: 'gallery', component: UserGalleryComponent
    },
    {
        path: 'participa', component: UserParticipateComponent
    },
    {
        path: 'login', component: UserLoginComponent
    },
    {
        path: 'misfotos', component: UserMisfotosComponent
    },
    {
        path: 'adminGallery', component: AdminGalleryComponent
    },
    {
        path: 'adminMenu', component: AdminMenuComponent
    },
    {
        path: 'gestionUsuarios', component: AdminUsuariosComponent
    },
    {
        path: 'gestionFotografias', component: AdminValidationComponent
    }
];
