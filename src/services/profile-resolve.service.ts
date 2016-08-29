import { Injectable }           from '@angular/core'
import { Router,
         Resolve,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router'
import { Observable }           from 'rxjs/Observable'

import { StorageService } from './storage.service'

@Injectable()
export class ProfileResolveService implements Resolve<any> {
    constructor(
        private storage: StorageService,
        private router: Router
    ) { }

    resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any> | Promise<any> | any {
        let profile = this.storage.get( 'profile' )

        return new Promise( ( resolve, reject ) => {
            if ( null === profile ) {
                this.router.navigate([ '/ranking' ])

                reject( false )
            } else {
                FB.api( `/${profile.id}/picture?redirect=0&width=80&height=80`, response => {
                    if ( response.data && response.data.url ) {
                        profile.picture.data = response.data
                    }

                    resolve( profile )
                })
            }
        })
    }
}
