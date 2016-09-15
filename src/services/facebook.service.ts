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
                    if ( roundtrip ) {
                        this.updateAccessToken( response.authResponse.accessToken )
                    }
                    resolve( response.authResponse.accessToken )
                } else if ( 'not_authorized' === response.status ) {
                    resolve( this.getAccessToken( true ) )
                } else {
                    reject( response )
                }
            }, roundtrip )
        })
    }

    updateAccessToken( token: string ) {
        let firebaseStorage = this.storage.get( 'user.firebase' )

        if ( firebaseStorage && firebaseStorage.credential ) {
            firebaseStorage.credential.accessToken = token
            this.storage.save( 'user.firebase', firebaseStorage )
        }
    }

    getFriends( uid: string = undefined, options: { onlyFriends?: boolean } = {} ): Promise<any> {
        uid = uid || this.getUID()
        options = {
            onlyFriends: undefined !== options.onlyFriends ? options.onlyFriends : false
        }

        let accessToken
        let data = {
            friends: [],
            invitableFriends: []
        }

        return new Promise( ( resolve, reject ) => {
            this.getAccessToken( true )
                .then( token => {
                    accessToken = token

                    if ( uid ) {
                        this.getPlayingFriends( uid )
                            .then( friends => {
                                data.friends = friends
                                data.friends = _.uniqBy( friends, 'name' )

                                if ( options.onlyFriends ) {
                                    data.invitableFriends = []
                                    resolve( data )
                                } else {
                                    FB.api( `/${uid}/invitable_friends`, { accessToken }, response => {
                                        this.extractPageFriends( response, accessToken, [] )
                                            .then( invitableFriends => {
                                                // _.forEach( invitableFriends, friend => console.log( friend.name ) )
                                                data.invitableFriends = _.uniqBy( invitableFriends, 'name' )
                                                resolve( data )
                                            })
                                            .catch( reject )
                                    })
                                }
                            })
                            .catch( reject )
                    } else {
                        reject( 'Bad Facebook UID: ' + uid )
                    }
                })
        })
    }

    getPlayingFriends( uid ): Promise<any[]> {
        uid = uid || this.getUID()

        return new Promise( ( resolve, reject ) => {
            this.getAccessToken( true )
                .then( token => {
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
                            friend.correlation = null
                            friends.push( friend )
                        })
                    }
                }

                if ( response.paging && response.paging.next ) {
                    FB.api( response.paging.next, { accessToken }, response => {
                        if ( response.data.length > 0 ) {
                            response.data.forEach( friend => {
                                friend.correlation = null
                                friends.push( friend )
                            })
                        }
                        this.extractPageFriends( response, accessToken, friends ).then( resolve )
                    })
                } else {
                    resolve( friends )
                }
            } else {
                reject( response )
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
                            reject( response )
                        }
                    })
                })
        })
    }

    logout(): void {
        this.storage.remove( 'user.facebook' )
    }
}
