import { Component, OnInit, Input } from '@angular/core'
import { Router, NavigationEnd }    from '@angular/router'

import { LangService }      from './../../services/lang.service'
import { TranslateService } from 'ng2-translate/ng2-translate'
import { AuthService }      from './../../services/auth.service'
import { UserService }      from './../../services/user.service'

@Component({
    moduleId: module.id,
    selector:  'app',
    templateUrl: 'app.component.html',
    styleUrls: [ 'app.component.css' ]
})
export class AppComponent implements OnInit {
    @Input()
    userLiked: boolean

    @Input()
    isHomePage: boolean

    constructor(
        private router: Router,
        private translate: TranslateService,
        private lang: LangService,
        private auth: AuthService,
        private user: UserService
    ) {
        const usedLang      = lang.used()
        const browserLang   = lang.browserLang()

        translate.setDefaultLang( browserLang.tag )
        translate.use( usedLang.tag )
    }

    ngOnInit() {
        /*
         * Router events
         */
        this.router
            .events
            .filter( event => event instanceof NavigationEnd )
            .subscribe( event => {
                /*
                 * Like management
                 */
                if ( !this.user.hasLiked() ) {
                    FB.Event.subscribe( 'edge.create', ( url, element ) => {
                        this.user.like()
                        this.userLiked = true
                    })
                }

                this.userLiked = this.user.hasLiked()
                this.isHomePage = '/home' === event.url || '/' === event.url
            })

        /*
         * Adapt main height
         */
        const $window = $( window )

        $window.resize( () => {
            const $footer = $( 'footer' )

            if ( $footer.length && $footer.height() > 0 ) {
                $( 'main' ).css( 'margin-bottom', $footer.innerHeight() + 20 )
            }
        })

        $( document ).ready( () => $window.trigger( 'resize' ) )
        // $window.on( 'beforeunload', () => this.auth.logout() )
    }
}
