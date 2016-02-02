import 'dogfalo/materialize';
import angular from 'angular';
import 'angular-ui-router';
import AppComponent from './app.component';
import AppConfig from './app.config';

const appModule = angular
  .module('app', ['ui.router'])
  .directive('app', AppComponent)
  .config(AppConfig);

let noAngularDom;

angular.element(document).ready(() => {
  const container = document.getElementById('app-container');

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
  const container = document.getElementById('app-container');
  container.remove();
  document.body.appendChild(noAngularDOM.cloneNode(true));
};

export default appModule;
