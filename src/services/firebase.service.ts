import { Injectable }   from '@angular/core'

import { StorageService } from './storage.service'


@Injectable()
export class FirebaseService {
    private isInit: boolean = false

    constructor(
        private storage: StorageService
    ) { }

    getUID(): any {
        const user = this.currentUser()

        return user && user.uid ? user.uid : null
    }

    currentUser(): any {
        return this.storage.defined( 'user.firebase' ) ? this.storage.get( 'user.firebase' ).user : null
    }

    login() {
        const provider = new firebase.auth.FacebookAuthProvider()
        provider.addScope( 'user_friends' )

        this.storage.save( 'pendingSignIn', true )

        firebase.auth().signInWithRedirect( provider )
    }

    logout(): Promise<any> {
        return firebase
            .auth()
            .signOut()
            .then( () => this.storage.remove( 'user.firebase' ) )
    }
}
