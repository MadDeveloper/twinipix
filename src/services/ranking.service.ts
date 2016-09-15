import { Injectable }   from '@angular/core'

import { FacebookService }      from './facebook.service'
import { StorageService }       from './storage.service'
import { QuizzService }         from './quizz.service'
import { NotificationService }  from './notification.service'

/*
 * Entities
 */
import { RankingFriend } from './../entities/ranking-friend'

@Injectable()
export class RankingService {
    constructor(
        private facebook: FacebookService,
        private storage: StorageService,
        private quizz: QuizzService,
        private notification: NotificationService
    ) { }

    get( facebookUID, options: { onlyFriends?: boolean, currentUser?: boolean } = {} ): Promise<{ friends: RankingFriend[]; invitableFriends: RankingFriend[]; }> {
        options = {
            onlyFriends: undefined !== options.onlyFriends ? options.onlyFriends : false,
            currentUser: undefined !== options.currentUser ? options.currentUser : true
        }

        return new Promise( ( resolve, reject ) => {
            const snapshot      = this.snapshot()
            const localVersion  = this.getLocalVersion()

            this.verifyVersion( facebookUID )
                .then( versionsMatch => {
                    this.notification
                        .notified( facebookUID )
                        .then( notified => {
                            if ( options.currentUser && !notified && versionsMatch ) {
                                resolve( snapshot || [] )
                            } else {
                                this.facebook
                                    .getFriends( facebookUID, { onlyFriends: options.onlyFriends } )
                                    .then( data => {
                                        let friendsBase: RankingFriend[] = data.friends
                                        let invitableFriends: RankingFriend[] = data.invitableFriends

                                        this.calculateCorrelations( facebookUID, friendsBase )
                                            .then( friends => {
                                                this.sort( friends )

                                                let response: { friends: RankingFriend[], invitableFriends?: RankingFriend[], version?: number } = options.onlyFriends ? { friends } : { friends, invitableFriends }

                                                if ( options.currentUser ) {
                                                    this.save( response )

                                                    if ( notified ) {
                                                        this.incrementVersion( facebookUID )
                                                            .then( () => this.notification.remove( facebookUID ) )
                                                            .then( () => resolve( response ) )
                                                            .catch( reject )
                                                    } else {
                                                        this.getStoredVersion( facebookUID )
                                                            .then( newVersion => this.updateLocalVersion( newVersion ) )
                                                            .then( () => resolve( response ) )
                                                    }
                                                } else {
                                                    resolve( response )
                                                }
                                            })
                                            .catch( reject )
                                    })
                                    .catch( reject )
                            }
                        })
                })
        })
    }

    verifyVersion( facebookUID: string ) {
        return this.getStoredVersion( facebookUID ).then( storedVersion => storedVersion == this.getLocalVersion() )
    }

    getLocalVersion() {
        let snapshot = this.snapshot()
        return snapshot && snapshot.version ? snapshot.version : 0
    }

    updateLocalVersion( newVersion: number ) {
        let snapshot = this.snapshot()
        snapshot.version = newVersion
        this.save( snapshot )
    }

    getStoredVersion( facebookUID: string ): Promise<number> {
        return firebase
            .database()
            .ref( `/versions/${facebookUID}` )
            .once( 'value' )
            .then( snapshot => snapshot.val() )
    }

    incrementVersion( facebookUID: string ): Promise<number> {
        return this.getStoredVersion( facebookUID )
            .then( storedVersion => {
                let newUserVersion = {}
                newUserVersion[ facebookUID ] = storedVersion + 1

                this.updateLocalVersion( storedVersion + 1 )

                return firebase
                    .database()
                    .ref( `/versions` )
                    .update( newUserVersion )
                    .then( () => newUserVersion[ facebookUID ] )
            })
    }

    snapshot(): any {
        return this.storage.get( 'user.ranking' )
    }

    save( ranking ) {
        this.storage.save( 'user.ranking', ranking )
    }

    remove() {
        this.storage.remove( 'user.ranking' )
    }

    calculateCorrelations( facebookUID: string, friends: RankingFriend[] ): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            if ( 0 === friends.length ) {
                resolve( friends )
            } else {
                this.getResult( facebookUID )
                    .then( result => {
                        const userResult = result
                        const numberFriends = friends.length

                        let friendsCorrelated = []
                        let requests = friends.reduce( ( promiseChain: any, friend: RankingFriend ) => {
                            return promiseChain.then( () => new Promise( ( resolve, reject ) => {
                                this.getResult( friend.id )
                                    .then( friendResult => {
                                        this.calculateCorrelation( userResult, friendResult )
                                            .then( correlation => {
                                                friend.correlation = correlation
                                                friendsCorrelated.push( friend )
                                                resolve()
                                            })
                                            .catch( reject )
                                    })
                                    .catch( reject )
                            }))
                        }, Promise.resolve() )

                        requests.then( () => {
                            resolve( friendsCorrelated )
                        })
                    })
                    .catch( reject )
            }
        })
    }

    calculateCorrelation( userResult: string, friendResult: string ): Promise<number> {
        if ( userResult && friendResult ) {
            return this.quizz
                .getQuestions()
                .then( questions => {
                    const numberTotalQuestions: number = Object.keys( questions ).length
                    const comparaison: string = this.compareResults( userResult, friendResult )
                    const correlation: number = Math.floor( ( ( comparaison.split( '1' ).length - 1 ) / numberTotalQuestions ) * 100 )

                    return correlation
                })
        } else {
            return Promise.resolve( null )
        }
    }

    getResult( facebookUID: string ): Promise<string> {
        return new Promise( ( resolve, reject ) => {
            firebase
                .database()
                .ref( `/quizz/results/${facebookUID}` )
                .once( 'value' )
                .then( snapshot => {
                    resolve( snapshot.val() )
                })
                .catch( reject )
        })
    }

    sort( ranking: RankingFriend[] ) {
        ranking.sort( ( a: RankingFriend, b: RankingFriend ) => {
            if ( null === a.correlation && null !== b.correlation ) {
                return 1
            } else if ( null !== a.correlation && null === b.correlation ) {
                return -1
            } else if ( a.correlation === b.correlation ) {
                return 0
            } else if ( a.correlation > b.correlation ) {
                return -1
            } else if ( a.correlation < b.correlation ) {
                return 1
            }

            return 0
        })
    }

    private compareResults( userResult: string, friendResult: string ): string {
        let comparaison: string = ''

        for( let i = 0, numberAnswers = userResult.length; i < numberAnswers; i += 4 ) {
            if ( userResult[ i ] === friendResult[ i ] && '1' === userResult[ i ] ) {
                comparaison += '1'
            } else if ( userResult[ i + 1 ] === friendResult[ i + 1 ] && '1' === userResult[ i + 1 ] ) {
                comparaison += '1'
            } else if ( userResult[ i + 2 ] === friendResult[ i + 2 ] && '1' === userResult[ i + 2 ] ) {
                comparaison += '1'
            } else if( userResult[ i + 3 ] === friendResult[ i + 3 ] && '1' === userResult[ i + 3 ] ) {
                comparaison += '1'
            } else {
                comparaison += '0'
            }
        }

        return comparaison
    }
}
