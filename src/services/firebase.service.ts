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
        const firebaseStorage = this.storage.get( 'user.firebase' )

        return firebaseStorage && undefined !== firebaseStorage ? firebaseStorage.user : null
    }

    login(): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            const provider = new firebase.auth.FacebookAuthProvider()
            provider.addScope( 'user_friends' )

            firebase
                .auth()
                .signInWithPopup( provider )
                .then( result => {
                    this.storage.save( 'user.firebase', result )
                    resolve()
                })
                .catch( reject )
        })
    }

    logout(): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            firebase
                .auth()
                .signOut()
                .then( () => {
                    this.storage.remove( 'user.firebase' )
                    resolve()
                })
                .catch( reject )
        })
    }
}
