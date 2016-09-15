import { Injectable } from '@angular/core'

import { UserService }      from './user.service'
import { FirebaseService }  from './firebase.service'

@Injectable()
export class AuthService {
    constructor(
        private user: UserService,
        private firebase: FirebaseService
    ) { }

    login(): Promise<any> {
        this.user.createStorageIfNotExist()

        return this.firebase
            .login()
            .then( () => this.user.login() )
    }

    logout() {
        this.firebase.logout()
        this.user.logout()
    }
}
