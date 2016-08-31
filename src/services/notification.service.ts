import { Injectable } from '@angular/core'

@Injectable()
export class NotificationService {
    notify( facebookUID: string ) {
        let update = {}
        update[ facebookUID ] = true

        return firebase
            .database()
            .ref( `/notified` )
            .update( update )
    }

    notifyAll( friends: any[] ): Promise<any> {
        let updates = {}

        friends.forEach( friend => {
            updates[ friend.id ] = true
        })

        return firebase
            .database()
            .ref( `/notified` )
            .update( updates )
    }

    notified( facebookUID: string ): Promise<boolean> {
        return firebase
            .database()
            .ref( `/notified/${facebookUID}` )
            .once( 'value' )
            .then( snapshot => true === snapshot.val() )
    }

    remove( facebookUID: string ): Promise<boolean> {
        return firebase
            .database()
            .ref( `/notified/${facebookUID}` )
            .remove()
    }
}
