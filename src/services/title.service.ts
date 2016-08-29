import { Injectable, Inject }   from '@angular/core'
import { Title }                from '@angular/platform-browser'

import { APP_CONFIG, AppConfig } from './../config/app.config'

@Injectable()
export class TitleService {
    constructor(
        @Inject( APP_CONFIG ) private config: AppConfig,
        private title: Title
    ) { }

    setTitle( title: string ) {
        this.title.setTitle( `${title} - ${this.config.title}` )
    }
}
