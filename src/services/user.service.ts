import { Injectable }               from '@angular/core'

import { SessionService }   from './session.service'
import { StorageService }   from './storage.service'
import { FirebaseService }  from './firebase.service'
import { FacebookService }  from './facebook.service'
import { RankingService }   from './ranking.service'
import { QuizzService }     from './quizz.service'

import { User } from './../entities/user'

@Injectable()
export class UserService {
    constructor(
        public session: SessionService,
        private storage: StorageService,
        private firebase: FirebaseService,
        private facebook: FacebookService,
        private ranking: RankingService,
        private quizz: QuizzService
    ) { }

    isLogged(): boolean {
        return this.storage.get( 'user' ).logged
    }

    login(): Promise<any> {
        this.session.create()

        const user = this.storage.get( 'user' )
        user.logged = true

        this.storage.save( 'user', user )

        return new Promise( ( resolve, reject ) => {
            this.getFirebaseUser()
            .then( user => {
                if ( null === user ) {
                    this.createFirebaseUser()
                        .then( resolve )
                        .catch( reject )
                } else {
                    resolve( user )
                }
            })
        })
    }

    logout() {
        this.storage.save( 'user.logged', false )
        this.quizz.remove()
        this.ranking.remove()
        this.session.destroy()
    }

    like() {
        let user = this.storage.get( 'user' )
        user.hasLiked = true

        this.storage.save( 'user', user )
    }

    hasLiked(): boolean {
        let user = this.storage.get( 'user' )

        if ( !user.hasOwnProperty( 'hasLiked' ) ) {
            user.hasLiked = false
            this.storage.save( 'user', user )
        }

        return user.hasLiked
    }

    createStorageIfNotExist() {
        if ( !this.storage.defined( 'user' ) ) {
            this.storage.define( 'user', { logged: false } )
        }
    }

    getFirebaseUser(): Promise<User> {
        return new Promise( ( resolve, reject ) => {
            /*
             * User space in database
             */
            const firebaseUser = this.firebase.currentUser()

            if ( firebaseUser ) {
                const userPath = `/users`
                const facebookUID = this.facebook.getUID()

                firebase
                    .database()
                    .ref( userPath )
                    .child( facebookUID )
                    .once( 'value' )
                    .then( snapshot => resolve( snapshot.val() ) )
                    .catch( reject )

            } else {
                reject()
            }
        })
    }

    createFirebaseUser(): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            /*
             * User space in database
             */
            const firebaseUser = this.firebase.currentUser()

            if ( firebaseUser ) {
                const facebookUID = this.facebook.getUID()

                let updates = {}
                updates[ `/users/${facebookUID}` ] = true
                updates[ `/version/${facebookUID}` ] = 0
                updates[ `/correspondences/${firebaseUser.uid}` ] = facebookUID

                firebase
                    .database()
                    .ref()
                    .update( updates )
                    .then( resolve )
                    .catch( reject )
            } else {
                reject()
            }
        })
    }

    remove() {
        const facebookUID = this.facebook.getUID()

        let updates = {}
        updates[ `/notified/${facebookUID}` ] = null
        updates[ `/quizz/results/${facebookUID}` ] = null
        updates[ `/users/${facebookUID}` ] = null
        updates[ `/versions/${facebookUID}` ] = null

        return firebase
            .database()
            .ref()
            .update( updates )
            .then( () => localStorage.clear() )
    }
}
