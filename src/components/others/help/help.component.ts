import { Component, OnInit } from '@angular/core'

import { TitleService }     from './../../../services/title.service'
import { TranslateService } from 'ng2-translate/ng2-translate'

@Component({
    moduleId: module.id,
    selector: 'help',
    templateUrl: 'help.component.html'
})
export class HelpComponent implements OnInit {
    constructor(
        private title: TitleService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.title.setTitle( this.translate.instant( 'help.tabTitle' ) )
    }
}
