import { Component } from 'angular2/core'

class Hero {
    id: number
    name: string
}

@Component({
  selector:  'app',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.css' ]
})
export class AppComponent {
    title = 'Tour of heroes'
    hero: Hero = {
        id: 1,
        name: 'Windstorm'
    }
}
