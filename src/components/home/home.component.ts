import { Component, OnInit, Inject }    from '@angular/core'
import { Router }                       from '@angular/router'

import { LangService }      from './../../services/lang.service'
import { TitleService }     from './../../services/title.service'
import { AuthService }      from './../../services/auth.service'
import { TranslateService } from 'ng2-translate/ng2-translate'

import { Lang } from './../../entities/lang'

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: [ 'home.component.css' ]
})
export class HomeComponent implements OnInit {
    langs: Lang[]
    langUsed: Lang

    constructor(
        private lang: LangService,
        private router: Router,
        private title: TitleService,
        private auth: AuthService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.langs = this.lang.availables()
        this.langUsed = this.lang.used()
        this.title.setTitle( 'Sign in' )
    }

    changeLang( lang: Lang ) {
        this.langUsed = this.lang.use( lang );

        (<any>$)( '.ui.modal' ).modal( 'hide' )

        this.translate.use( this.langUsed.tag )
    }

    openLangModal( event: Event ) {
        event.preventDefault();

        (<any>$)( '.ui.modal' )
            .modal({
                blurring: true
            })
            .modal( 'show' )
    }

    login() {
        this.auth
            .login()
            .then( () => this.router.navigate([ '/ranking' ]) )
            .catch( error => {
                console.log( error )
                $( '#login-error' ).removeClass( 'none' )
            })
    }
}
