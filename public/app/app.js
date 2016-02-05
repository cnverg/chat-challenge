import './app.css!';
import 'angular-aria';
import 'angular-animate';
import 'angular-cookies';
import 'angular-resource';
import 'angular-material';
import 'angular-ui-router';
import 'dogfalo/materialize';

import angular from 'angular';
import AppRun from './app.run';
import AppConfig from './app.config';
import Constants from './utils/constants';
import * as Factories from './app.factory';

import PreBootstrapLoaderComponent from './components/preBootstrapLoader/pre-bootstrap-loader.component';

const appModule = angular
  .module(Constants.appModule, ['ngResource', 'ngAnimate', 'ngMaterial', 'ngCookies', 'ui.router'])
  .directive(Constants.preBootstrapLoader, PreBootstrapLoaderComponent)
  .config(AppConfig)
  .run(AppRun);

for (let factoryName in Factories) {
  appModule.factory(factoryName, Factories[factoryName]);  
}

let noAngularDom;

angular.element(document).ready(() => {
  const container = document.getElementById(Constants.appContainer);

  if (location.origin.match(/localhost/)) {
    System.trace = true;
    noAngularDom = container.cloneNode(true);
  }
  
  angular.bootstrap(container, [appModule.name], {
    strictDi: true
  });
});

export default appModule;

export default function __unload() {  
  const container = document.getElementById(Constants.appContainer);
  container.remove();
  document.body.appendChild(noAngularDOM.cloneNode(true));
};

export default appModule;
