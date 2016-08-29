import { Injectable } from '@angular/core'

import { StorageService } from './storage.service'

@Injectable()
export class FacebookService {
    private _init: boolean = false

    constructor(
        private storage: StorageService
    ) { }

    getUID(): any {
        const firebaseStored = this.storage.get( 'user.firebase' )

        return firebaseStored && firebaseStored.user ? firebaseStored.user.providerData[ 0 ].uid : null
    }

    getAccessToken(): Promise<any> {
        // const firebaseStored = this.storage.get( 'user.firebase' )
        // return firebaseStored && firebaseStored.credential ? firebaseStored.credential.accessToken : null

        return new Promise( ( resolve, reject ) => {
            FB.getLoginStatus( response => {
                resolve( response.authResponse.accessToken )
            })
        })
    }

    getFriends(): Promise<any> {
        const uid = this.getUID()
        let accessToken
        let data = {
            friends: [],
            invitableFriends: []
        }

        return new Promise( ( resolve, reject ) => {
            this.getAccessToken()
                .then( token => {
                    accessToken = token

                    if ( uid ) {
                        FB.api( `/${uid}/invitable_friends`, { accessToken }, response => {
                            this.extractPageFriends( response, accessToken )
                                .then( invitableFriends => {
                                    // console.log( 'base', friends.length )
                                    data.invitableFriends = invitableFriends.slice( 0 )
                                    // data.invitableFriends.forEach( friend => {
                                    //     console.log( `invitable ${friend.name}` )
                                    // })
                                    // console.log( 'data.invitableFriends', data.invitableFriends.length )

                                    FB.api( `/${uid}/friends?fields=id,name,picture`, { accessToken }, response => {
                                        this.extractPageFriends( response, accessToken )
                                            .then( friends => {
                                                // data.friends = response.data
                                                data.friends = friends.slice( 0 )
                                                // data.friends.forEach( friend => {
                                                //     console.log( `friends ${friend.name}` )
                                                // })
                                                // console.log( 'data.friends', data.friends.length )
                                                resolve( data )
                                            })
                                    })
                                })
                        })
                    } else {
                        reject()
                    }
                })
        })
    }

    extractPageFriends( response, accessToken, friends?: any[] ): Promise<any[]> {
        return new Promise( ( resolve, reject ) => {
            if ( !friends ) {
                friends = []
                if ( response.data.length > 0 ) {
                    response.data.forEach( friend => {
                        // console.log( `friend first ${friend.name}` )
                        friend.correlation = 0
                        friends.push( friend )
                    })
                }
            }

            if ( response.paging && response.paging.next ) {
                FB.api( response.paging.next, { accessToken }, response => {
                    if ( response.data.length > 0 ) {
                        response.data.forEach( friend => {
                            // console.log( `friend second ${friend.name}` )
                            friend.correlation = 0
                            friends.push( friend )
                        })
                    }
                    this.extractPageFriends( response, accessToken, friends ).then( resolve )
                })
            } else {
                resolve( friends )
            }
        })
    }

    isLogged(): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            FB.getLoginStatus( response => {
                if ( 'connected' === response.status ) {
                    resolve( response )
                } else {
                    reject( response )
                }
            })
        })
    }

    login(): Promise<facebook.AuthResponse> {
        return new Promise( ( resolve, reject ) => {
            this.isLogged()
                .then( response => {
                    this.storage.save( 'user.facebook', response )
                    resolve( response )
                })
                .catch( () => {
                    FB.login( response => {
                        if ( "connected" === response.status ) {
                            this.storage.save( 'user.facebook', response )
                            resolve( response )
                        } else {
                            reject()
                        }
                    })
                })
        })
    }

    logout(): void {
        this.storage.remove( 'user.facebook' )
    }
}
