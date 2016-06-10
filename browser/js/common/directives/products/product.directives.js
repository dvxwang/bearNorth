app.directive('productCatalogListing', function(CartFactory) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/products/product-catalog-listing.html',
    scope: {
      product: '='
    },
    link: function(scope, element, attrs) {
      scope.addToCart = function(product) {
        CartFactory.addToCart(product);
      };
    }
  };
});
