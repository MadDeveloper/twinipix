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

    get( facebookUID, options: { useSnapshot?: boolean; save?: boolean, onlyFriends?: boolean, currentUser?: boolean } = {} ): Promise<{ friends: RankingFriend[]; invitableFriends: RankingFriend[]; }> {
        options = {
            useSnapshot: undefined !== options.useSnapshot ? options.useSnapshot : false,
            save: undefined !== options.save ? options.save : true,
            onlyFriends: undefined !== options.onlyFriends ? options.onlyFriends : false,
            currentUser: undefined !== options.currentUser ? options.currentUser : true
        }

        return new Promise( ( resolve, reject ) => {
            const snapshot = this.snapshot()

            if ( options.useSnapshot ) {
                resolve( snapshot || [] )
            } else {
                this.notification
                    .notified( facebookUID )
                    .then( notified => {

                        if ( !notified && snapshot && options.currentUser ) {
                            resolve( snapshot || [] )
                        } else {
                            this.facebook
                                .getFriends( facebookUID, { onlyFriends: options.onlyFriends } )
                                .then( data => {
                                    let friends: RankingFriend[] = data.friends
                                    let invitableFriends: RankingFriend[] = data.invitableFriends

                                    this.calculateCorrelations( facebookUID, friends )
                                        .then( friends => {
                                            this.sort( friends )

                                            let response = options.onlyFriends ? { friends } : { friends, invitableFriends }

                                            if ( options.save ) {
                                                this.save( response )
                                            }

                                            if ( notified ) {
                                                this.notification
                                                    .remove( facebookUID )
                                                    .then( () => resolve( response ) )
                                                    .catch( reject )
                                            } else {
                                                resolve( response )
                                            }
                                        })
                                        .catch( reject )
                                })
                                .catch( reject )
                        }
                    })
                    .catch( reject )
            }
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

                        friends.forEach( ( friend, index ) => {
                            this.getResult( friend.id )
                                .then( friendResult => {
                                    this.calculateCorrelation( userResult, friendResult )
                                        .then( correlation => {
                                            friend.correlation = correlation
                                            friends[ index ] = friend

                                            if ( index >= ( numberFriends - 1 ) ) {
                                                resolve( friends )
                                            }
                                        })
                                        .catch( reject )
                                })
                                .catch( reject )
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
            if ( a.correlation > b.correlation ) {
                return -1
            } else if ( a.correlation < b.correlation || ( null === a.correlation && null !== b.correlation ) ) {
                return 1
            }

            return 0
        })

        return ranking
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
