import { Component, OnInit }    from '@angular/core'
import { Router }               from '@angular/router'

import { TitleService }     from './../../../services/title.service'
import { TranslateService } from 'ng2-translate/ng2-translate'

@Component({
    moduleId: module.id,
    selector: 'about',
    templateUrl: 'about.component.html'
})
export class AboutComponent implements OnInit {
    constructor(
        private router: Router,
        private title: TitleService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'About' )
    }
}
