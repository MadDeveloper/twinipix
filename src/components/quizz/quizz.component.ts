import { Component, OnInit }    from '@angular/core'
import { Router }               from '@angular/router'

import { TitleService } from './../../services/title.service'
import { QuizzService } from './../../services/quizz.service'
import { UserService }  from './../../services/user.service'

import { Question } from './../../entities/question'

@Component({
    moduleId: module.id,
    selector: 'quizz',
    templateUrl: 'quizz.component.html',
    styleUrls: [ 'quizz.component.css' ]
})
export class QuizzComponent implements OnInit {
    // question: Question
    questions: Question[]

    constructor(
        private title: TitleService,
        private quizz: QuizzService,
        private user: UserService,
        private router: Router
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Quizz' )

        this.quizz
            .getQuizz()
            .then( quizz => {
                this.questions = quizz.questions
            })
    }
}
