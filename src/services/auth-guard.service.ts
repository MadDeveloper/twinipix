import { Injectable, Inject }   from '@angular/core'
import { Router,
        CanActivate,
        ActivatedRouteSnapshot,
        RouterStateSnapshot }   from '@angular/router'

import { UserService }      from './user.service'
import { FacebookService }  from './facebook.service'
import { AuthService }      from './auth.service'
import { StorageService }   from './storage.service'

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private router: Router,
        private user: UserService,
        private facebook: FacebookService,
        private auth: AuthService,
        private storage: StorageService
    ) { }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): boolean | Promise<boolean> {
        if ( this.onHomePage( state ) ) {
            if ( this.user.isLogged() ) {
                this.router.navigate([ '/ranking' ])
                return false
            } else {
                if ( this.storage.defined( 'pendingSignIn' ) ) {
                    this.auth
                        .handleSignInRedirection()
                        .then( () => {
                            this.router.navigate([ '/ranking' ])
                            return false
                        })
                        .catch( () => {
                            return true
                        })
                } else {
                    return true
                }
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
