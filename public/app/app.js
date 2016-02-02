import 'angular-ui-router';
import angular from 'angular';
import AppConfig from './app.config';
import AppComponent from './app.component';

const appModule = angular
  .module('app', [])
  .config(AppConfig)
  .directive('app', AppComponent);

export default appModule;
