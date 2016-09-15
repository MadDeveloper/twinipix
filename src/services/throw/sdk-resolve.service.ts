import { Injectable }           from '@angular/core'
import { Resolve,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router'
import { Observable }           from 'rxjs/Observable'

import { FacebookService } from './../facebook.service'

@Injectable()
export class SDKResolveService implements Resolve<any> {
    private initialized: boolean = false

    constructor(
        private facebook: FacebookService
    ) { }

    resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any> | Promise<any> | any {
        if ( !this.initialized ) {
            Promise.resolve( true )
            // return this.facebook
            //     .ready()
            //     .then( () => {
            //         console.log( 'Facebook SDK imported and initialized' )
            //         this.initialized = true
            //         return true
            //     })
        } else {
            Promise.resolve( true )
        }
    }
}
