import { Injectable }   from '@angular/core'

import { FacebookService }  from './facebook.service'
import { StorageService }   from './storage.service'
import { QuizzService }     from './quizz.service'

/*
 * Entities
 */
import { RankingFriend } from './../entities/ranking-friend'

@Injectable()
export class RankingService {
    private dayBeforeExpiration: number = 5

    constructor(
        private facebook: FacebookService,
        private storage: StorageService,
        private quizz: QuizzService
    ) { }

    get( userfacebookID ): Promise<{ friends: RankingFriend[]; invitableFriends: RankingFriend[]; }> {
        return new Promise( ( resolve, reject ) => {
            if ( !this.snapshotExpired() ) {
                resolve( this.snapshot() )
            } else {
                this.facebook
                    .getFriends()
                    .then( data => {
                        let friends: RankingFriend[] = data.friends
                        let invitableFriends: RankingFriend[] = data.invitableFriends

                        this.calculateCorrelations( userfacebookID, friends )
                            .then( friends => {
                                this.sort( friends )

                                this.save({ friends, invitableFriends })
                                resolve({ friends, invitableFriends })
                            })
                            .catch( reject )
                    })
                    .catch( reject )
            }
        })
    }

    snapshot(): any {
        return this.storage.get( 'user.ranking' )
    }

    snapshotExpired(): boolean {
        const snapshotExpiration = this.storage.get( 'user.rankingExpiration' )
        const now = Date.now()

        if ( !snapshotExpiration || snapshotExpiration < now ) {
            return true
        }
    }

    save( ranking: { friends: RankingFriend[]; invitableFriends: RankingFriend[]; } ) {
        this.storage.save( 'user.ranking', ranking )
        this.storage.save( 'user.rankingExpiration', Date.now() + ( 86400000 * this.dayBeforeExpiration ) )
    }

    remove() {
        this.storage.remove( 'user.ranking' )
        this.storage.remove( 'user.rankingExpiration' )
    }

    calculateCorrelations( userfacebookID: string, friends: RankingFriend[] ): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            this.getResult( userfacebookID )
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
        })
    }

    calculateCorrelation( userResult: string, friendResult: string ): Promise<number> {
        return new Promise( ( resolve, reject ) => {
            let userResult
            let friendResult

            if ( userResult && friendResult ) {
                this.quizz
                    .getQuizz()
                    .then( quizz => {
                        const numberTotalAnswers: number = Object.keys( quizz.questions ).length * 4
                        const comparaison: string = this.compareResults( userResult, friendResult )
                        const correlation: number = Math.floor( ( ( comparaison.split( '2' ).length - 1 ) / numberTotalAnswers ) * 100 )

                        resolve( correlation )
                    })
                    .catch( reject )
            } else {
                resolve( null )
            }
        })
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

        for( let i = 0, numberAnswers = userResult.length; i < numberAnswers; i++  ) {
            comparaison += userResult[ i ] === friendResult[ i ] ? '2' : '0'
        }

        return comparaison
    }
}
