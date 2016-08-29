import { Component, OnInit }    from '@angular/core'
import { Router }               from '@angular/router'

import { TitleService }     from './../../services/title.service'
import { StorageService }   from './../../services/storage.service'
import { QuizzService }     from './../../services/quizz.service'
import { UserService }      from './../../services/user.service'

import { Question } from './../../entities/question'
import { Answer }   from './../../entities/answer'

@Component({
    moduleId: module.id,
    selector: 'quizz',
    templateUrl: 'quizz.component.html',
    styleUrls: [ 'quizz.component.css' ]
})
export class QuizzComponent implements OnInit {
    question: Question
    questions: Question[]
    answers: Answer[]

    constructor(
        private title: TitleService,
        private storage: StorageService,
        private quizz: QuizzService,
        private user: UserService,
        private router: Router
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Quizz' )
        this.remove()
        this.quizz
            .getQuizz()
            .then( quizz => {
                this.questions = quizz.questions
                this.getCurrentQuestion()
                    .then( question => {
                        this.question = question
                    })
            })
    }

    validate( answer: Answer ) {

    }

    displayNextQuestion() {
        this.getNextQuestion()
            .then( question => {
                this.question = question
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
            Promise.resolve( quizzStorage.currentQuestion )
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

    finished(): boolean {
        const quizzStorage = this.storage.get( 'user.quizz' )

        return undefined !== quizzStorage.finished && true === quizzStorage.finished
    }

    private getFirebaseNextQuestion( currentQuestion: Question ): Promise<Question> {
        return firebase
            .database()
            .ref( `/quizz/questions/${currentQuestion.id + 1}` )
            .once( 'value' )
            .then( snapshot => {
                return snapshot.val()
            })
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

    private remove() {
        this.storage.remove( 'user.quizz' )
    }
}
