/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
  // map tells the System loader where to look for things
  var map = {
    '@angular':                   'node_modules/@angular',
    'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
    'rxjs':                       'node_modules/rxjs',
    'ng2-translate':              'node_modules/ng2-translate',
    'firebase':                   'node_modules/firebase/firebase.js',
    'lodash':                     'node_modules/lodash'
  };
  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'public':                       { main: 'main.js',  defaultExtension: 'js' },
    'rxjs':                         { defaultExtension: 'js' },
    'angular2-in-memory-web-api':   { main: 'index.js', defaultExtension: 'js' },
    'lodash':                       { main: 'lodash.js', defaultExtension: 'js' }
  };
  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
  ];
  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }
  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: 'bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }
  // Most environments should use UMD; some (Karma) need the individual index files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);

  var config = {
    baseURL: "/",
    defaultJSExtensions: true,
    map: map,
    packages: packages
  };
  System.config(config);
})(this);
