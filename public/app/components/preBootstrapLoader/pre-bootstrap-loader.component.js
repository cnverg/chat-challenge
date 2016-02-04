import { Inject } from '../../utils/decorators';

const preBootstrapLoaderComponent = ($animate) => {
  const link = (scope, element, attributes) => {
    $animate.leave( element.children().eq(1) ).then(() => {
      element.remove();
      scope = element = attributes = null;
    });
  };

  return {
    link,
    restrict: 'C'
  };
};

Inject('$animate')(preBootstrapLoaderComponent);

export default preBootstrapLoaderComponent;
