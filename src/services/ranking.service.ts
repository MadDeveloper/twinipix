import { Injectable }   from '@angular/core'

import { UserService }      from './user.service'
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
        private user: UserService,
        private facebook: FacebookService,
        private storage: StorageService,
        private quizz: QuizzService
    ) { }

    get(): Promise<{ friends: RankingFriend[]; invitableFriends: RankingFriend[]; }> {
        return new Promise( ( resolve, reject ) => {
            if ( !this.snapshotExpired() ) {
                resolve( this.snapshot() )
            } else {
                this.facebook
                    .getFriends()
                    .then( data => {
                        let friends: RankingFriend[] = data.friends
                        let invitableFriends: RankingFriend[] = data.invitableFriends

                        this.save({ friends, invitableFriends })
                        resolve({ friends, invitableFriends })
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

    calculateCorrelation( userFacebookID: string, friendFacebookID: string ): Promise<number> {
        return new Promise( ( resolve, reject ) => {
            let userResult
            let friendResult

            this.getResult( userFacebookID )
                .then( result => {
                    userResult = result
                    return this.getResult( friendFacebookID )
                })
                .then( result => {
                    if ( result ) {
                        friendResult = result

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
                .catch( reject )
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

    private compareResults( userResult: string, friendResult: string ): string {
        let comparaison: string = ''

        for( let i = 0, numberAnswers = userResult.length; i < numberAnswers; i++  ) {
            comparaison += userResult[ i ] === friendResult[ i ] ? '2' : '0'
        }

        return comparaison
    }
}
