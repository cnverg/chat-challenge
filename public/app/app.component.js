import './app.css!';
import template from './app.html!text';
import controller from './app.controller';

const appComponent = () => ({
  template,
  controller,
  restrict: 'E'
});

export default appComponent;
