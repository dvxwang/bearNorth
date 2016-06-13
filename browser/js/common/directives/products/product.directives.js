app.directive('productCatalogListing', function(CartFactory) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/products/product-catalog-listing.html',
    scope: {
      product: '='
    },
    link: function(scope) {
      scope.addToCart = function(product) {
        return CartFactory.addToCart(product);
      };
    }
  };
});
