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
        private storage: StorageService,
        private ranking: RankingService,
        private user: UserService,
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
            .get( this.userfacebookID, { useSnapshot: false, save: false, onlyFriends: true, currentUser: false } )
            .then( ranking => {
                this.toggleLoading( 'disable' )
                this.allFriends = this.friends = ranking.friends
                this.friendsLoaded = true
            })
    }

    ngOnDestroy() {
        this.storage.remove( 'profile' )
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
