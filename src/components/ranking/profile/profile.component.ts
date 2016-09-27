/*
 * Dependencies
 */
import { Component,
         OnInit,
         OnDestroy }                from '@angular/core'
import { Router, ActivatedRoute }   from '@angular/router'
import { TranslateService }         from 'ng2-translate/ng2-translate'

/*
 * Services
 */
import { StorageService }   from './../../../services/storage.service'
import { RankingService }   from './../../../services/ranking.service'
import { UserService }      from './../../../services/user.service'
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
    friends: RankingFriend[] = []

    private profile: RankingFriend

    private friendsLoaded: boolean = false
    private friendsPerPage: number = 25
    private startFriendsIndex: number = 0
    private allFriends: RankingFriend[] = []
    private remainFriendsToDisplay: boolean = false

    private userfacebookID: string

    private $loader: JQuery
    private loadingNextPage: boolean = false

    constructor(
        private title: TitleService,
        private translate: TranslateService,
        private storage: StorageService,
        private ranking: RankingService,
        private user: UserService,
        private firebase: FirebaseService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.data.forEach(( data: { profile: any }) => {
            this.profile = data.profile
        })
        this.title.setTitle( this.profile.name )
        this.userfacebookID = this.profile.id
        this.$loader = $( '#loader-ranking-item' )
        this.toggleLoading( 'enable' )
        this.ranking
            .get( this.userfacebookID, { onlyFriends: true, currentUser: false } )
            .then( ranking => {
                this.toggleLoading( 'disable' )
                this.allFriends = this.friends = ranking.friends
                this.friendsLoaded = true
            })
    }

    ngOnDestroy() {
        this.storage.remove( 'profile' )
    }

    share() {
        const correlation   = this.profile.correlation
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
                friendName: this.profile.name,
                correlation: this.profile.correlation
            }),
            description: this.translate.instant( 'sharing.doTheQuizz' ),
            picture,
            link: 'http://twinipix.com',
            name: 'Twinipix'
        }, response => {
            console.log( response )
        })
    }

    goBack() {
        window.history.back()
    }

    setProfileCircleProgressClasses() {
        let classes = {
            'c100': true,
            'extra-small': true
        }

        classes[ `p${this.profile.correlation}` ] = true

        return classes
    }

    setCircleProgressClasses( friend ) {
        let classes = {
            'c100': true,
            'extra-small': true
        }

        classes[ `p${friend.correlation}` ] = true

        return classes
    }

    getNextFriendsPage() {
        this.remainFriendsToDisplay = ( this.startFriendsIndex + this.friendsPerPage ) < this.allFriends.length

        if ( this.allFriends.length < this.friendsPerPage && null !== this.startFriendsIndex ) {
            this.remainFriendsToDisplay = true
        }

        if ( this.remainFriendsToDisplay ) {
            let endFriendIndex = this.startFriendsIndex + ( this.friendsPerPage - 1 )

            this.toggleLoading( 'enable' )

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

            this.toggleLoading( 'disable' )

            if ( endFriendIndex - this.startFriendsIndex >= this.friendsPerPage - 1 ) {
                this.startFriendsIndex = endFriendIndex + 1
            }
        }
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
