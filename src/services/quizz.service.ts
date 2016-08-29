import { Injectable } from '@angular/core'

import { FirebaseService } from './firebase.service'

import { Quizz } from './../entities/quizz'

@Injectable()
export class QuizzService {
    constructor(
        private firebase: FirebaseService
    ) { }

    getQuizz(): Promise<Quizz> {
        return new Promise( ( resolve, reject ) => {
            firebase
                .database()
                .ref( '/quizz' )
                .once( 'value' )
                .then( snapshot => {
                    resolve( snapshot.val() )
                })
                .catch( reject )
        })
    }

    getResult( facebookUID ): Promise<string> {
        return new Promise( ( resolve, reject ) => {
            firebase
                .database()
                .ref( `/users/${facebookUID}` )
                .once( 'value' )
                .then( snapshot => resolve( snapshot.val() ) )
                .catch( reject )
        })
    }
}
