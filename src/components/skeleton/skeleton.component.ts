import { Component, OnInit } from '@angular/core'

import { TitleService } from './../../services/title.service'

@Component({
    moduleId: module.id,
    selector: 'skeleton',
    templateUrl: 'skeleton.component.html',
    styleUrls: [ 'skeleton.component.css' ]
})
export class SkeletonComponent implements OnInit {
    constructor(
        private title: TitleService
    ) { }

    ngOnInit() {
        this.title.setTitle( 'Skeleton' )
    }
}
