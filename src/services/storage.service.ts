import { Injectable } from '@angular/core'

import { Storage } from './../interfaces/storage/storage'

@Injectable()
export class StorageService implements Storage {
    /*
     * Storage interface
     */
    get( key: string ): any {
        if ( -1 !== key.indexOf( '.' ) ) {
            let { master, prop } = this.extractMasterAndProperty( key )

            return master[ prop ]
        } else {
            if ( !this.defined( key ) ) {
                this.define( key, {} )
            }

            return JSON.parse( localStorage.getItem( key ) )
        }
    }

    save( key: string, value: Object ): void {
        if ( -1 !== key.indexOf( '.' ) ) {
            let { data, master, prop } = this.extractMasterAndProperty( key )

            master[ prop ] = value
            localStorage.setItem( data[ 0 ], JSON.stringify( master ) )
        } else {
            localStorage.setItem( key, JSON.stringify( value ) )
        }
    }

    remove( key: string ): void {
        if ( -1 !== key.indexOf( '.' ) ) {
            let { data, master, prop } = this.extractMasterAndProperty( key )

            master[ prop ] = undefined
            localStorage.setItem( data[ 0 ], JSON.stringify( master ) )
        } else {
            localStorage.removeItem( key )
        }
    }

    defined( key: string ): boolean {
        if ( -1 !== key.indexOf( '.' ) ) {
            let { data, master, prop } = this.extractMasterAndProperty( key )

            return master.hasOwnProperty( prop ) && undefined !== master[ prop ]
        } else {
            return null !== localStorage.getItem( key )
        }
    }

    define( key: string, value: Object ): void {
        if ( -1 !== key.indexOf( '.' ) ) {
            let { data, master, prop } = this.extractMasterAndProperty( key )

            if ( !this.defined( data[ 0 ] ) ) {
                this.define( data[ 0 ], {} )
            }

            this.save( key, value )
        } else {
            localStorage.setItem( key, JSON.stringify( value ) )
        }
    }

    private extractMasterAndProperty( key: string )  {
        const data      = key.split( '.' )
        const master    = JSON.parse( localStorage.getItem( data[ 0 ] ) )
        const prop      = data[ 1 ]

        return {
            data,
            master,
            prop
        }
    }
}
