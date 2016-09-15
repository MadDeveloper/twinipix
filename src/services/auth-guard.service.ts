import { Injectable, Inject }   from '@angular/core'
import { Router,
        CanActivate,
        ActivatedRouteSnapshot,
        RouterStateSnapshot }   from '@angular/router'

import { UserService }      from './user.service'
import { FacebookService }  from './facebook.service'

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private router: Router,
        private user: UserService,
        private facebook: FacebookService
    ) { }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): boolean {
        if ( this.onHomePage( state ) ) {
            if ( this.user.isLogged() ) {
                this.router.navigate([ '/ranking' ])
                return false
            } else {
                return true
            }
        } else {
            if ( this.user.isLogged() ) {
                return true
            } else {
                this.router.navigate([ '/home' ])
                return false
            }
        }
    }

    private onHomePage( state: RouterStateSnapshot ): boolean {
        return '/home' === state.url || '/' === state.url
    }
}
