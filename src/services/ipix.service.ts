import { Injectable }       from '@angular/core'

import { FirebaseService }  from './firebase.service'
import { FacebookService }  from './facebook.service'

@Injectable()
export class IpixService {
    constructor(
        private facebook: FacebookService,
        private firebase: FirebaseService
    ) { }
}
