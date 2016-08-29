import 'public/rxjs.extensions.js'
import { platformBrowserDynamic }   from '@angular/platform-browser-dynamic'
import { AppModule }                from './app.module'

platformBrowserDynamic().bootstrapModule( AppModule )
