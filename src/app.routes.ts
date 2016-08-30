import { Routes, RouterModule } from '@angular/router'

import { AuthGuardService }         from './services/auth-guard.service'
import { ProfileResolveService }    from './services/profile-resolve.service'
import { QuizzGuardService }        from './services/quizz-guard.service'

import { HomeComponent }            from './components/home/home.component'
import { RankingComponent }         from './components/ranking/ranking.component'
import { ProfileComponent }         from './components/ranking/profile/profile.component'
import { QuizzComponent }           from './components/quizz/quizz.component'
import { IpixComponent }            from './components/ipix/ipix.component'
import { OthersComponent }          from './components/others/others.component'
import { HelpComponent }            from './components/others/help/help.component'
import { ConditionsComponent }      from './components/others/conditions/conditions.component'
import { ConfidentialityComponent } from './components/others/confidentiality/confidentiality.component'
import { AboutComponent }           from './components/others/about/about.component'

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: 'ranking',
        component: RankingComponent,
        canActivate: [ AuthGuardService, QuizzGuardService ]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [ AuthGuardService, QuizzGuardService ],
        resolve: {
            profile: ProfileResolveService
        }
    },
    {
        path: 'quizz',
        component: QuizzComponent,
        canActivate: [ AuthGuardService, QuizzGuardService ]
    },
    {
        path: 'others',
        component: OthersComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: 'help',
        component: HelpComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: 'conditions',
        component: ConditionsComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: 'confidentiality',
        component: ConfidentialityComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: 'about',
        component: AboutComponent,
        canActivate: [ AuthGuardService ]
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    }
]

export const routing = RouterModule.forRoot( routes )
