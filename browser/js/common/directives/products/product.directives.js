app.directive('productCatalogListing', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/products/product-catalog-listing.html',
    scope: {
      product: '='
    }
  };
});
