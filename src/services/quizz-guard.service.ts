import { Injectable, Inject }   from '@angular/core'
import { Router,
        CanActivate,
        ActivatedRouteSnapshot,
        RouterStateSnapshot }   from '@angular/router'

import { StorageService }   from './storage.service'
import { QuizzService }     from './quizz.service'

@Injectable()
export class QuizzGuardService implements CanActivate {
    constructor(
        private router: Router,
        private storage: StorageService,
        private quizz: QuizzService
    ) { }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<boolean> {
        return this.quizz
            .isFinished()
            .then( done => {
                const onQuizzPage = this.onQuizzPage( state )

                if ( !done && !onQuizzPage ) {
                    this.router.navigate([ '/quizz' ])
                    return false
                } else if ( done && onQuizzPage ) {
                    this.router.navigate([ '/ranking' ])
                    return false
                }

                return true
            })
    }

    private onQuizzPage( state: RouterStateSnapshot ): boolean {
        return '/quizz' === state.url || '/' === state.url
    }
}
