import { Component,
         OnInit,
         OnDestroy }                from '@angular/core'
import { Router }                   from '@angular/router'
import { DomSanitizationService }   from '@angular/platform-browser'

import { TitleService }     from './../../services/title.service'
import { StorageService }   from './../../services/storage.service'
import { QuizzService }     from './../../services/quizz.service'
import { UserService }      from './../../services/user.service'

import { Question } from './../../entities/question'

@Component({
    moduleId: module.id,
    selector: 'quizz',
    templateUrl: 'quizz.component.html',
    styleUrls: [ 'quizz.component.css' ]
})
export class QuizzComponent implements OnInit {
    question: Question
    ipixOne: any
    ipixTwo: any
    ipixTree: any
    ipixFour: any
    choices: any[] = []

    private ipixsObserver: any

    constructor(
        private title: TitleService,
        private storage: StorageService,
        private quizz: QuizzService,
        private user: UserService,
        private router: Router,
        private sanitizer: DomSanitizationService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Quizz' )
        // this.quizz.remove()
        this.quizz
            .getCurrentQuestion()
            .then( question => {
                this.displayQuestion( question )
            })
        this.resizeQuestionHandler()
    }

    ngOnDestroy() {
        this.ipixsObserver.disconnect()
    }

    validate( choice ) {
        this.choices.push( choice )
        this.displayNextQuestion()
    }

    displayNextQuestion() {
        this.quizz
            .getNextQuestion()
            .then( question => {
                this.displayQuestion( question )
            })
    }

    displayQuestion( question: Question ) {
        if ( null !== question ) {
            this.question = question
            this.ipixOne = this.sanitizer.bypassSecurityTrustStyle( `url('${this.question.ipixs[ 1 ]}')` )
            this.ipixTwo =  this.sanitizer.bypassSecurityTrustStyle( `url('${this.question.ipixs[ 2 ]}')` )
            this.ipixTree =  this.sanitizer.bypassSecurityTrustStyle( `url('${this.question.ipixs[ 3 ]}')` )
            this.ipixFour =  this.sanitizer.bypassSecurityTrustStyle( `url('${this.question.ipixs[ 4 ]}')` )
        } else {
            this.quizz
                .finished( this.choices )
                .then( this.quizz.isFinished )
                .then( isFinished => {
                    if ( isFinished ) {
                        this.router.navigate([ '/ranking' ])
                    } else {
                        // this.router.navigate([ '/quizz' ])
                    }
                })
                .catch( error => {
                    // this.router.navigate([ '/quizz' ])
                })
        }
    }

    resizeQuestionHandler() {
        let $window = $( window )

        this.ipixsObserver = new MutationObserver( ( mutations: MutationRecord[] ) => {
            const mutation: MutationRecord = mutations[ 0 ]

            if ( mutation.addedNodes.length > 0 ) {
                const $questionContainer    = $( mutation.target )
                const $question             = $( mutation.addedNodes[ 0 ] )
                const $wording              = $( $question.children()[ 0 ] )
                const $iPixContainer        = $( $question.children()[ 1 ] )

                $window.on( 'resize', () => {
                    resizeQuestion( $questionContainer, $question )
                    resizeIpixContainer( $iPixContainer )
                })
                $window.trigger( 'resize' )
            }
        })

        this.ipixsObserver.observe( document.getElementById( 'question-container' ), {
            attributes: true,
            childList: true,
            characterData: true
        })

        function resizeQuestion( $questionContainer: JQuery, $question: JQuery ) {
            const $footer = $( 'footer' )
            const $header = $( 'header' )

            $questionContainer.innerHeight( $window.height() - $header.innerHeight() )

            if ( $footer.length > 0 ) {
                $questionContainer.innerHeight( $questionContainer.innerHeight() - $footer.innerHeight() )
            }

            $questionContainer.innerHeight( $questionContainer.innerHeight() - 5 )
            $question.innerHeight( $questionContainer.innerHeight() )
        }

        function resizeIpixContainer( $ipixContainer ) {

        }
    }
}
