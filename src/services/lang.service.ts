import { Injectable } from '@angular/core'

import { StorageService } from './storage.service'

import { Lang } from './../entities/lang'

@Injectable()
export class LangService {
    constructor(
        private storage: StorageService
    ) { }

    browserLang(): Lang {
        let lang = navigator.language;

        if ( lang.indexOf( '-' ) ) {
            lang = lang.substring( 0, lang.indexOf( '-' ) )
        }

        return this.validate( lang )
    }

    used(): Lang {
        if ( !this.storage.defined( 'lang' ) ) {
            this.use( this.browserLang() )
        }

        return this.storage.get( 'lang' )
    }

    use( lang: Lang ): Lang {
        lang = this.validate( lang )
        this.storage.save( 'lang', lang )

        return lang
    }

    availables(): Lang[] {
        return [
            {  name: 'Français', tag: 'fr' },
            {  name: 'English', tag: 'en' },
            {  name: 'Español', tag: 'es' }
        ]
    }

    private validate( langToValidate: string | Lang ): Lang {
        const lang: Lang[] = this.availables().filter( currentLang => {
            if ( 'string' === typeof langToValidate ) {
                return langToValidate === currentLang.tag
            } else {
                return (<Lang>langToValidate).tag === currentLang.tag
            }
        })

        return lang.length > 0 ? lang[ 0 ] : { name: 'Français', tag: 'fr' }
    }
}
