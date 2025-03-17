import { Routes } from '@angular/router';
import { UserMenuComponent } from './components/usuario/user-menu/user-menu.component';
import { UserInfoComponent } from './components/usuario/user-info/user-info.component';
import { UserGalleryComponent } from './components/usuario/user-gallery/user-gallery.component';
import { UserParticipateComponent } from './components/usuario/user-participate/user-participate.component';
import { UserLoginComponent } from './components/usuario/user-login/user-login.component';

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
    }
];
