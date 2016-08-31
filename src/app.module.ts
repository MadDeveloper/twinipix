import { NgModule }             from '@angular/core'
import { BrowserModule, Title } from '@angular/platform-browser'
import { FormsModule }          from '@angular/forms'
import { HttpModule, Http }     from '@angular/http'
import { TranslateModule,
         TranslateLoader,
         TranslateStaticLoader} from 'ng2-translate/ng2-translate'

/*
 * Config
 */
import { APP_CONFIG, APP_CONFIG_VALUES } from './config/app.config'

/*
 * App component and routing
 */
import { AppComponent } from './components/app/app.component'
import { routing }      from './app.routes'

/*
 * Services
 */
import { LangService }              from './services/lang.service'
import { TitleService }             from './services/title.service'
import { FacebookService }          from './services/facebook.service'
import { FirebaseService }          from './services/firebase.service'
import { AuthGuardService }         from './services/auth-guard.service'
import { AuthService }              from './services/auth.service'
import { StorageService }           from './services/storage.service'
import { SessionService }           from './services/session.service'
import { UserService }              from './services/user.service'
import { RankingService }           from './services/ranking.service'
import { ProfileResolveService }    from './services/profile-resolve.service'
import { QuizzService }             from './services/quizz.service'
import { QuizzGuardService }        from './services/quizz-guard.service'
import { NotificationService }      from './services/notification.service'

/*
 * Global components
 */
import { HeaderComponent }  from './components/header/header.component'
import { FooterComponent }  from './components/footer/footer.component'

/*
 * App Components
 */
import { HomeComponent }            from './components/home/home.component'
import { RankingComponent }         from './components/ranking/ranking.component'
import { ProfileComponent }         from './components/ranking/profile/profile.component'
import { QuizzComponent }           from './components/quizz/quizz.component'
import { OthersComponent }          from './components/others/others.component'
import { HelpComponent }            from './components/others/help/help.component'
import { ConditionsComponent }      from './components/others/conditions/conditions.component'
import { ConfidentialityComponent } from './components/others/confidentiality/confidentiality.component'
import { AboutComponent }           from './components/others/about/about.component'

/*
 * Pipes
 */
import { KeysPipe } from './pipes/keys.pipe'

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: ( http: Http ) => new TranslateStaticLoader( http, '/public/assets/translations', '.json' ),
            deps: [ Http ]
        }),
        routing
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        HomeComponent,
        RankingComponent,
        ProfileComponent,
        QuizzComponent,
        OthersComponent,
        HelpComponent,
        ConditionsComponent,
        ConfidentialityComponent,
        AboutComponent,
        KeysPipe
    ],
    providers: [
        LangService,
        Title,
        TitleService,
        StorageService,
        FacebookService,
        FirebaseService,
        AuthGuardService,
        AuthService,
        SessionService,
        UserService,
        RankingService,
        ProfileResolveService,
        QuizzService,
        QuizzGuardService,
        NotificationService,
        { provide: APP_CONFIG, useValue: APP_CONFIG_VALUES }
    ],
    exports: [ AppComponent, TranslateModule ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
