/*
 * Dependencies
 */
import { Component,
         OnInit,
         OnDestroy }                from '@angular/core'
import { Router, ActivatedRoute }   from '@angular/router'

/*
 * Services
 */
import { StorageService }   from './../../../services/storage.service'
import { RankingService }   from './../../../services/ranking.service'
import { UserService }      from './../../../services/user.service'
import { FacebookService }  from './../../../services/facebook.service'
import { FirebaseService }  from './../../../services/firebase.service'
import { TitleService }     from './../../../services/title.service'

/*
 * Entities
 */
import { RankingFriend } from './../../../entities/ranking-friend'

@Component({
    moduleId: module.id,
    selector: 'profile',
    templateUrl: 'profile.component.html',
    styleUrls: [ 'profile.component.css' ]
})
export class ProfileComponent implements OnInit, OnDestroy {
    private profile: RankingFriend

    constructor(
        private title: TitleService,
        private storage: StorageService,
        private ranking: RankingService,
        private user: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private facebook: FacebookService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Profile' )
        this.route.data.forEach(( data: { profile: any }) => {
            this.profile = data.profile
        })
    }

    ngOnDestroy() {
        this.storage.remove( 'profile' )
    }

    goBack() {
        window.history.back()
    }

    setCircleProgressClasses() {
        let classes = {
            'c100': true,
            'extra-small': true
        }

        classes[ `p${this.profile.correlation}` ] = true

        return classes
    }
}
