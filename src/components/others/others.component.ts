import { Component, OnInit }    from '@angular/core'
import { Router }               from '@angular/router'

import { LangService }      from './../../services/lang.service'
import { TitleService }     from './../../services/title.service'
import { AuthService }      from './../../services/auth.service'
import { TranslateService } from 'ng2-translate/ng2-translate'

import { Lang } from './../../entities/lang'

@Component({
    moduleId: module.id,
    selector: 'others',
    templateUrl: 'others.component.html',
    styleUrls: [ 'others.component.css' ]
})
export class OthersComponent implements OnInit {
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
        this.title.setTitle( this.translate.instant( 'others.tabTitle' ) )
        this.langs = this.lang.availables()
        this.langUsed = this.lang.used()
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

    logout() {
        this.auth.logout()
        this.router.navigate([ '/home' ])
    }
}
