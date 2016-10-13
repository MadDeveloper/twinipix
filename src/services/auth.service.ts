import { Injectable } from '@angular/core'

import { UserService }      from './user.service'
import { FirebaseService }  from './firebase.service'
import { StorageService }   from './storage.service'

@Injectable()
export class AuthService {
    constructor(
        private user: UserService,
        private firebase: FirebaseService,
        private storage: StorageService
    ) { }

    login() {
        this.user.createStorageIfNotExist()

        this.firebase.login()
    }

    logout() {
        this.firebase.logout()
        this.user.logout()
    }

    handleSignInRedirection(): Promise<any> {
        return firebase
            .auth()
            .getRedirectResult()
            .then( result => {
                this.storage.remove( 'pendingSignIn' )
                this.storage.save( 'user.firebase', result )
                
                return this.user.login()
            })
            .catch( error => {
                this.storage.remove( 'pendingSignIn' )

                return error
            })
    }
}
