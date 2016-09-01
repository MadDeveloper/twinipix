/*
 * Dependencies
 */
import { Component,
         OnInit,
         Input }    from '@angular/core'
import { Router }   from '@angular/router'

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

    private friendsPerPage: number = 25
    private startFriendsIndex: number = 0
    private allFriends: RankingFriend[] = []
    private remainFriendsToDisplay: boolean = false

    private userfacebookID: string

    private loadingNextPage: boolean = false

    constructor(
        private title: TitleService,
        private storage: StorageService,
        private ranking: RankingService,
        private router: Router,
        private facebook: FacebookService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Search' )
        this.initScrollPageEvent()
        this.userfacebookID = this.facebook.getUID()
        this.ranking
            .get( this.userfacebookID, { forSearch: true } )
            .then( ranking => this.allFriends = this.friends = ranking.friends )
    }

    search( term: string ) {
        this.friends = this.allFriends.filter( friend => -1 !== friend.name.indexOf( term ) )
    }

    gotoProfile( friend: RankingFriend ) {
        this.storage.save( 'profile', friend )
        this.router.navigate([ '/profile' ])
    }

    getNextFriendsPage() {
        this.remainFriendsToDisplay = ( this.startFriendsIndex + this.friendsPerPage ) < this.allFriends.length

        if ( this.allFriends.length < this.friendsPerPage && null !== this.startFriendsIndex ) {
            this.remainFriendsToDisplay = true
        }

        if ( this.remainFriendsToDisplay ) {
            let endFriendIndex = this.startFriendsIndex + ( this.friendsPerPage - 1 )

            this.loadingNextPage = true

            if ( endFriendIndex + 1 > this.allFriends.length ) {
                endFriendIndex = this.allFriends.length - 1
            }

            for ( let index = this.startFriendsIndex; index <= endFriendIndex; index++ ) {
                let friend = this.allFriends[ index ]

                if ( !friend.picture || !friend.picture.data || !friend.picture.data.url ) {
                    friend.picture = {
                        data: {
                            url: '/public/assets/images/facebook-default-no-profile-pic.jpg'
                        }
                    }
                }

                this.friends[ index ] = friend
            }

            this.loadingNextPage = false

            if ( endFriendIndex - this.startFriendsIndex >= this.friendsPerPage - 1 ) {
                this.startFriendsIndex = endFriendIndex + 1
            }
        }
    }

    setCircleProgressClasses( friend ) {
        let classes = {
            'c100': true,
            'extra-small': true
        }

        classes[ `p${friend.correlation}` ] = true

        return classes
    }

    initScrollPageEvent() {
        const $document = $( document )
        const $window = $( window )
        let currentScroll

        $document.ready( () => {
            $document.on( 'scroll', () => {
                currentScroll = $document.scrollTop()

                if ( currentScroll >= $document.height() - $window.height() && !this.loadingNextPage ) {
                    this.getNextFriendsPage()
                }
            })
        })
    }
}
