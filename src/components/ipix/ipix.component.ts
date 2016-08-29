import { Component, OnInit } from '@angular/core'

import { TitleService } from './../../services/title.service'

@Component({
    moduleId: module.id,
    selector: 'ipix',
    templateUrl: 'ipix.component.html',
    styleUrls: [ 'ipix.component.css' ]
})
export class IpixComponent implements OnInit {
    constructor(
        private title: TitleService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Ipix' )
    }
}
