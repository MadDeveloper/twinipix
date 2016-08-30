import { Injectable } from '@angular/core'

import { StorageService }   from './storage.service'
import { FacebookService }  from './facebook.service'

import { Quizz } from './../entities/quizz'
import { Question } from './../entities/question'

@Injectable()
export class QuizzService {
    constructor(
        private storage: StorageService,
        private facebook: FacebookService
    ) { }

    getQuestions(): Promise<Quizz> {
        return new Promise( ( resolve, reject ) => {
            firebase
                .database()
                .ref( '/quizz/questions' )
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
                .ref( `/quizz/results/${facebookUID}` )
                .once( 'value' )
                .then( snapshot => resolve( snapshot.val() ) )
                .catch( reject )
        })
    }

    getCurrentQuestion(): Promise<Question> {
        let quizzStorage = this.storage.get( 'user.quizz' )

        if ( !quizzStorage ) {
            this.storage.save( 'user.quizz', { currentQuestion: null } )
            quizzStorage = {}
            quizzStorage.currentQuestion = null
        }

        if ( !quizzStorage.currentQuestion ) {
            return this.getFirebaseFirstQuestion()
                .then( question => {
                    quizzStorage.currentQuestion = question

                    return this.getFirebaseNextQuestion( question )
                })
                .then( nextQuestion => {
                    quizzStorage.nextQuestion = nextQuestion
                    this.storage.save( 'user.quizz', quizzStorage )

                    return quizzStorage.currentQuestion
                })
        } else {
            return Promise.resolve( quizzStorage.currentQuestion )
        }
    }

    getNextQuestion(): Promise<Question> {
        let quizzStorage = this.storage.get( 'user.quizz' )
        let nextQuestion: Question = quizzStorage.nextQuestion

        return this.updateCurrentQuestion( nextQuestion )
            .then( () => {
                return nextQuestion
            })
    }

    updateCurrentQuestion( nextQuestion: Question ): Promise<boolean> {
        let quizzStorage = this.storage.get( 'user.quizz' )

        return this.getFirebaseNextQuestion( nextQuestion )
            .then( newNextQuestion => {
                quizzStorage.currentQuestion = nextQuestion
                quizzStorage.nextQuestion = newNextQuestion
                this.storage.save( 'user.quizz', quizzStorage )

                return true
            })
    }

    finished( choices ): Promise<any> {
        const facebookUID = this.facebook.getUID()
        const quizzStorage = this.storage.get( 'user.quizz' )
        let result = {}
        result[ facebookUID ] = choices

        quizzStorage.finished = true
        quizzStorage.choices = choices

        return firebase
            .database()
            .ref( `/quizz/results/${facebookUID}` )
            .set( choices.join( '' ) )
            .then( () => this.storage.save( 'user.quizz', quizzStorage ) )
            .then( () =>
                this.facebook
                    .getPlayingFriends()
                    .then( friends => {
                        let updates = {}

                        friends.forEach( friend => {
                            updates[ friend.id ] = true
                        })

                        return firebase
                            .database()
                            .ref( `/notified` )
                            .update( updates )
                    })
            )
    }

    isFinished(): Promise<boolean> {
        const facebookUID = this.facebook.getUID()

        return firebase
            .database()
            .ref( `/quizz/results/${facebookUID}` )
            .once( 'value' )
            .then( snapshot => {
                const finished = snapshot.val()

                return null !== finished
            })
    }

    private getFirebaseNextQuestion( currentQuestion: Question ): Promise<Question> {
        if ( null === currentQuestion ) {
            return Promise.resolve( null )
        } else {
            return firebase
                .database()
                .ref( `/quizz/questions/${currentQuestion.id + 1}` )
                .once( 'value' )
                .then( snapshot => {
                    return snapshot.val()
                })
        }
    }

    private getFirebaseFirstQuestion(): Promise<Question> {
        return firebase
            .database()
            .ref( `/quizz/questions/1` )
            .once( 'value' )
            .then( snapshot => {
                return snapshot.val()
            })
    }

    remove() {
        this.storage.remove( 'user.quizz' )
    }
}
