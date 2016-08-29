import { Injectable } from '@angular/core'

import { StorageService } from './storage.service'

import { Session } from './../entities/session'

@Injectable()
export class SessionService {
    duration: number = 7180

    constructor(
        private storage: StorageService
    ) { }

    get(): Session {
        if ( !this.storage.defined( 'session' ) ) {
            this.create()
        }

        return this.storage.get( 'session' )
    }

    isValid(): boolean {
        if ( this.storage.defined( 'session' ) ) {
            const session = this.get()
            const now = Math.floor( Date.now() / 1000 )

            return now < session.end
        } else {
            return false
        }
    }

    revalidate(): void {
        const session = this.get()
        const now = Math.floor( Date.now() / 1000 )

        session.end += this.duration

        this.storage.save( 'session', session )
    }

    invalidate(): void {
        this.storage.save( 'session.end', 0 )
    }

    destroy(): void {
        this.storage.remove( 'session' )
    }

    create(): void {
        const now = Math.floor( Date.now() / 1000 )
        const session: Session = {
            start: now,
            end: now + this.duration
        }

        this.storage.save( 'session', session )
    }
}
