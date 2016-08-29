import { Injectable } from '@angular/core'

import { Quizz } from './../entities/quizz'

@Injectable()
export class QuizzService {
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
