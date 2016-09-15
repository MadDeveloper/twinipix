import { Component }    from '@angular/core'
import { Router }       from '@angular/router'

import { TitleService } from './../../services/title.service'

@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: 'header.component.html',
    styleUrls: [ 'header.component.css' ]
})
export class HeaderComponent {
    constructor(
        private title: TitleService,
        private router: Router
    ) { }

    public search() {
        this.setTitle( 'Search' )
    }

    public setTitle( title: string ) {
        this.title.setTitle( title )
    }
}
