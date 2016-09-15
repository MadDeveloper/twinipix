import { Injectable }           from '@angular/core'
import { Router,
         Resolve,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router'
import { Observable }           from 'rxjs/Observable'

@Injectable()
export class HomeResolveService implements Resolve<any> {
    constructor() { }

    resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any> | Promise<any> | any {
        return new Promise( ( resolve, reject ) => {
            FB.getLoginStatus( response => {
                if ( response && 'unknown' !== response.status ) {
                    FB.api( `/${response.authResponse.userID}`, user => {
                        if ( user && user.name ) {
                            resolve( user )
                        } else {
                            resolve( null )
                        }
                    })
                } else {
                    resolve( null )
                }
            })
        })
    }
}
