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
        private facebook: FacebookService,
        private firebase: FirebaseService
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
        const correlation   = friend.correlation
        const lang          = this.translate.currentLang
        let picture         = 'http://twinipix.com/public/assets/images/'

        if ( correlation < 30 ) {
            picture = `yin-yang-${lang}.svg`
        } else if ( correlation >= 30 && correlation < 50 ) {
            picture = `puzzle-${lang}.svg`
        } else if ( correlation >= 50 && correlation < 70 ) {
            picture = `balance-${lang}.svg`
        } else if ( correlation >= 70 && correlation < 90 ) {
            picture = `harmony-${lang}.svg`
        } else if ( correlation >= 90 && correlation <= 99 ) {
            picture = 'twins.svg'
        } else {
            picture = `perfect-twins-${lang}.svg`
        }

        FB.ui({
            method: 'feed',
            display: 'iframe',
            caption: this.translate.instant( 'sharing.title', {
                userName: this.firebase.currentUser().displayName,
                friendName: friend.name,
                correlation: friend.correlation
            }),
            description: this.translate.instant( 'sharing.doTheQuizz' ),
            picture,
            link: 'http://twinipix.com',
            name: 'Twinipix'
        }, response => {
            console.log( response )
        })
    }

    invite( friend: RankingFriend ) {
        FB.ui({
            method: 'apprequests',
            title: 'Twinipix',
            message: this.translate.instant( 'invite.doYourQuizz', { name: friend.name } ),
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
