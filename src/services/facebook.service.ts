import { Injectable }   from '@angular/core'
import * as _           from 'lodash'

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

    getAccessToken( roundtrip?: boolean ): Promise<any> {
        // const firebaseStored = this.storage.get( 'user.firebase' )
        // firebaseStored && firebaseStored.credential ? firebaseStored.credential.accessToken : null
        return new Promise( ( resolve, reject ) => {
            FB.getLoginStatus( response => {
                if ( 'connected' === response.status ) {
                    resolve( response.authResponse.accessToken )
                } else if ( 'not_authorized' === response.status ) {
                    resolve( this.getAccessToken( true ) )
                } else {
                    reject( response )
                }
            }, roundtrip )
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
                            this.extractPageFriends( response, accessToken, [] )
                                .then( invitableFriends => {
                                    // _.forEach( invitableFriends, friend => console.log( friend.name ) )
                                    data.invitableFriends = _.uniqBy( invitableFriends, 'name' )

                                    this.getPlayingFriends()
                                        .then( friends => {
                                            data.friends = _.uniqBy( friends, 'name' )
                                            resolve( data )
                                        })
                                        .catch( reject )
                                })
                                .catch( reject )
                        })
                    } else {
                        reject()
                    }
                })
        })
    }

    getPlayingFriends(): Promise<any[]> {
        return new Promise( ( resolve, reject ) => {
            this.getAccessToken()
                .then( token => {
                    const uid = this.getUID()
                    const accessToken = token

                    if ( uid ) {
                        FB.api( `/${uid}/friends?fields=id,name,picture`, { accessToken }, response => {
                            this.extractPageFriends( response, accessToken, [] ).then( resolve )
                        })
                    } else {
                        resolve([])
                    }
                })
        })
    }

    extractPageFriends( response, accessToken, friends: any[] ): Promise<any[]> {
        return new Promise( ( resolve, reject ) => {
            if ( !response.error ) {
                if ( 0 === friends.length ) {
                    friends = []
                    if ( response.data.length > 0 ) {
                        response.data.forEach( friend => {
                            friend.correlation = 0
                            friends.push( friend )
                        })
                    }
                }

                if ( response.paging && response.paging.next ) {
                    FB.api( response.paging.next, { accessToken }, response => {
                        if ( response.data.length > 0 ) {
                            response.data.forEach( friend => {
                                friend.correlation = 0
                                friends.push( friend )
                            })
                        }
                        this.extractPageFriends( response, accessToken, friends ).then( resolve )
                    })
                } else {
                    resolve( friends )
                }
            } else {
                reject()
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
