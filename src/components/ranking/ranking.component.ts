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
import { UserService }      from './../../services/user.service'
import { FacebookService }  from './../../services/facebook.service'
import { FirebaseService }  from './../../services/firebase.service'
import { TitleService }     from './../../services/title.service'

/*
 * Entities
 */
import { RankingFriend } from './../../entities/ranking-friend'

@Component({
    moduleId: module.id,
    selector: 'ranking',
    templateUrl: 'ranking.component.html',
    styleUrls: [ 'ranking.component.css' ]
})
export class RankingComponent implements OnInit {
    friends: RankingFriend[] = []
    invitableFriends: RankingFriend[] = []

    private friendsPerPage: number = 25
    private startFriendsIndex: number = 0
    private startInvitableFriendsIndex = 0
    private allFriends: RankingFriend[] = []
    private allInvitableFriends: RankingFriend[] = []
    private remainFriendsToDisplay: boolean = false
    private remainInvitableFriendsToDisplay: boolean = false

    private userfacebookID: string

    private $loader: JQuery
    private loadingNextPage: boolean = false

    constructor(
        private title: TitleService,
        private storage: StorageService,
        private ranking: RankingService,
        private user: UserService,
        private router: Router,
        private facebook: FacebookService
    ) {
        this.user
            .didQuizz()
            .then( done => {
                if ( !done ) {
                    this.router.navigate([ '/quizz' ])
                }
            })
        this.userfacebookID = this.facebook.getUID()
    }

    ngOnInit() {
        this.title.setTitle( 'Ranking' )
        this.$loader = $( '#loader-ranking-item' )
        this.initScrollPageEvent()
        this.toggleLoading( 'enable' )
        this.ranking
            .get( this.userfacebookID )
            .then( ranking => {
                this.allFriends = ranking.friends.slice( 0 )
                this.allInvitableFriends = ranking.invitableFriends.slice( 0 )
                this.getNextFriendsPage()
            })
            .catch( error => {
                this.toggleLoading( 'disable' )
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
            this.toggleLoading( 'enable' )

            let endFriendIndex = this.startFriendsIndex + ( this.friendsPerPage - 1 )

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

                this.friends.push( friend )
            }

            if ( endFriendIndex - this.startFriendsIndex < this.friendsPerPage - 1 ) {
                this.startFriendsIndex = null
                this.getNextInvitableFriendsPage( endFriendIndex - this.startFriendsIndex + 1 )
            } else {
                this.startFriendsIndex = endFriendIndex + 1
                this.toggleLoading( 'disable' )
            }
        } else {
            this.getNextInvitableFriendsPage()
        }
    }

    getNextInvitableFriendsPage( alreadyDisplayed: number = 0 ) {
        this.remainInvitableFriendsToDisplay = ( this.startInvitableFriendsIndex + this.friendsPerPage ) < this.allInvitableFriends.length

        if ( this.allInvitableFriends.length < this.friendsPerPage ) {
            this.remainInvitableFriendsToDisplay = true
        }

        if ( this.remainInvitableFriendsToDisplay ) {
            this.toggleLoading( 'enable' )

            let endFriendIndex = this.startInvitableFriendsIndex + ( this.friendsPerPage - 1 )
            endFriendIndex = alreadyDisplayed > 0 ? endFriendIndex - ( alreadyDisplayed - 1 ) : endFriendIndex

            if ( endFriendIndex + 1 > this.allInvitableFriends.length ) {
                endFriendIndex = this.allInvitableFriends.length - 1
            }

            for ( let index = this.startInvitableFriendsIndex; index <= endFriendIndex; index++ ) {
                let friend = this.allInvitableFriends[ index ]

                if ( !friend.picture || !friend.picture.data || !friend.picture.data.url ) {
                    friend.picture = {
                        data: {
                            url: '/public/assets/images/facebook-default-no-profile-pic.jpg'
                        }
                    }
                }

                this.invitableFriends.push( friend )
            }

            this.startInvitableFriendsIndex = endFriendIndex + 1
            this.toggleLoading( 'disable' )
        }
    }

    numberOfInvitableFriends() {
        return this.allInvitableFriends.length
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

    toggleLoading( type: string ) {
        if ( 'disable' === type && this.loadingNextPage ) {
            this.$loader.addClass( 'display none' )
            this.loadingNextPage = false
        } else if ( 'enable' === type && !this.loadingNextPage ) {
            this.$loader.removeClass( 'display none' )
            this.loadingNextPage = true
        }
    }
}
