import { Injectable, Inject }   from '@angular/core'
import { Router,
        CanActivate,
        ActivatedRouteSnapshot,
        RouterStateSnapshot }   from '@angular/router'

import { StorageService }   from './storage.service'
import { UserService }      from './user.service'

@Injectable()
export class QuizzGuardService implements CanActivate {
    constructor(
        private router: Router,
        private storage: StorageService,
        private user: UserService
    ) { }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<boolean> {
        return this.user
            .didQuizz()
            .then( done => {
                if ( !done ) {
                    this.router.navigate([ '/quizz' ])
                    return false
                }

                return true
            })
    }
}
