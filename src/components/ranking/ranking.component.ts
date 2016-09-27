/*
 * Dependencies
 */
import { Component,
         OnInit,
         OnDestroy,
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
    selector: 'ranking',
    templateUrl: 'ranking.component.html',
    styleUrls: [ 'ranking.component.css' ]
})
export class RankingComponent implements OnInit, OnDestroy {
    friends: RankingFriend[] = []
    invitableFriends: RankingFriend[] = []

    private friendsPerPage: number = 25
    private startFriendsIndex: number = 0
    private startInvitableFriendsIndex = 0
    private allFriends: RankingFriend[] = []
    private allInvitableFriends: RankingFriend[] = []
    private invitableFriendsObserver: MutationObserver
    private remainFriendsToDisplay: boolean = false
    private remainInvitableFriendsToDisplay: boolean = false

    private userfacebookID: string

    private $loader: JQuery
    private loadingNextPage: boolean = false
    private clickToSeeInvitableFriends: boolean = false

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
        this.title.setTitle( this.translate.instant( 'ranking.tabTitle' ) )
        this.$loader = $( '#loader-ranking-item' )
        this.initScrollPageEvent()
        this.toggleLoading( 'enable' )
        this.userfacebookID = this.facebook.getUID()
        // this.ranking.remove()
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
        this.invitableFriendsHandler()
    }

    ngOnDestroy() {

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

                this.friends[ index ] = friend
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

                this.invitableFriends[ index ] = friend
            }

            this.startInvitableFriendsIndex = endFriendIndex + 1
            this.toggleLoading( 'disable' )
        }
    }

    seeInvitableFriends() {
        const numberOfFriends = this.allFriends.length

        if ( numberOfFriends < this.friendsPerPage ) {
            $( 'html, body' ).animate({ scrollTop: $( '.invitable-friend' ).first().offset().top })
        } else {
            this.friends = this.allFriends

            if ( 0 === this.startInvitableFriendsIndex ) {
                this.getNextInvitableFriendsPage()
            }

            this.clickToSeeInvitableFriends = true
        }
    }

    invitableFriendsHandler() {
        this.invitableFriendsObserver = new MutationObserver( ( mutations: MutationRecord[] ) => {
            if( this.clickToSeeInvitableFriends ) {
                $( 'html, body' ).animate({ scrollTop: $( '.invitable-friend' ).first().offset().top })
                this.clickToSeeInvitableFriends = false
            }
        })

        this.invitableFriendsObserver.observe( document.getElementById( 'friends-container' ), {
            attributes: true,
            childList: true,
            characterData: true
        })
    }

    numberOfInvitableFriends() {
        return this.allInvitableFriends.length
    }

    numberOfFriends() {
        return this.friends.length
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
