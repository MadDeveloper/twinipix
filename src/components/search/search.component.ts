/*
 * Dependencies
 */
import { Component,
         OnInit,
         Input }            from '@angular/core'
import { Router }           from '@angular/router'
import { TranslateService } from 'ng2-translate/ng2-translate'

/*
 * Services
 */
import { StorageService }   from './../../services/storage.service'
import { RankingService }   from './../../services/ranking.service'
import { FacebookService }  from './../../services/facebook.service'
import { FirebaseService }  from './../../services/firebase.service'
import { TitleService }     from './../../services/title.service'

/*
 * Entities
 */
import { RankingFriend } from './../../entities/ranking-friend'

@Component({
    moduleId: module.id,
    selector: 'search',
    templateUrl: 'search.component.html',
    styleUrls: [ 'search.component.css' ]
})
export class SearchComponent implements OnInit {
    friends: RankingFriend[] = []
    invitableFriends: RankingFriend[] = []

    private friendsPerPage: number = 25
    private allFriends: RankingFriend[] = []
    private allInvitableFriends: RankingFriend[] = []

    private userfacebookID: string

    constructor(
        private title: TitleService,
        private translate: TranslateService,
        private storage: StorageService,
        private ranking: RankingService,
        private router: Router,
        private facebook: FacebookService
    ) { }

    ngOnInit() {
        this.title.setTitle( this.translate.instant( 'search.tabTitle' ) )
        this.userfacebookID = this.facebook.getUID()
        this.ranking.get( this.userfacebookID ).then( ranking => {
            this.allFriends = this.friends = ranking.friends
            this.allInvitableFriends = this.invitableFriends = ranking.invitableFriends
        })
    }

    share( friend: RankingFriend ) {
        FB.ui({
            method: 'share',
            mobile_iframe: true,
            href: 'http://twinipix.com'
        }, response => {
            console.log( response )
        })
    }

    invite( friend: RankingFriend ) {
        FB.ui({
            method: 'apprequests',
            title: 'Twinipix',
            message: 'Come try Twinipix in order to compare us!',
            to: friend.id
        }, response => console.log( response ))
    }

    search( term: string ) {
        term = term.trim().toLowerCase()
        this.friends = this.allFriends.filter( friend => -1 !== friend.name.toLowerCase().indexOf( term ) )
        this.invitableFriends = this.allInvitableFriends.filter( friend => -1 !== friend.name.toLowerCase().indexOf( term ) )
    }

    gotoProfile( friend: RankingFriend ) {
        this.storage.save( 'profile', friend )
        this.router.navigate([ '/profile' ])
    }

    setCircleProgressClasses( friend ) {
        let classes = {
            'c100': true,
            'extra-small': true
        }

        classes[ `p${friend.correlation}` ] = true

        return classes
    }
}
