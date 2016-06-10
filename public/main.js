'use strict';

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // Trigger page refresh when accessing an OAuth route
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});

app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.

    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.signup = function (credentials) {
            return $http.post('/signup', credentials).then(onSuccessfulLogin).catch(function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function ($state, $scope) {

    $scope.goToSurvey = function (activity) {
        console.log("here");
        var choice = activity.target.firstChild.data;
        $state.go('survey', { choice: choice });
    };
});

app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;
        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('package', {
        url: '/package/:selection',
        templateUrl: 'js/package/package.html',
        controller: 'PackageCtrl'
    });
});

app.controller('PackageCtrl', function ($state, $scope, $stateParams, $http) {
    var selectObj = $stateParams.selection.split(',');

    $scope.criteria = selectObj;

    var queryObj = {
        activity: selectObj[0],
        difficulty: selectObj[1],
        climate: selectObj[2],
        trip_length: selectObj[3]
    };

    $http.get('/api/products/allCategories').then(function (result) {
        $scope.categories = result.data;
    });

    $http.get('/api/boxes/match', { params: queryObj }).then(function (result) {
        $scope.mainPackage = result.data;
        $scope.totalPrice = "$" + result.data.reduce(function (a, b) {
            a += Number(b.purchase_price);
            return a;
        }, 0).toFixed(2);
        $scope.rentalPrice = "$" + result.data.reduce(function (a, b) {
            a += Number(b.rental_price);
            return a;
        }, 0).toFixed(2);
    });

    $scope.seeMore = function (item) {
        $scope.wantToAdd = false;
        $scope.currentItem = item;
        $http.post('/api/products/categories', { category: item.category }).then(function (result) {
            $scope.altCategory = "Alternative: " + item.category;
            $scope.alternatives = result.data;
        });
    };

    $scope.seeMoreOptions = function () {
        var category = document.getElementById("optionBar").value;
        $http.post('/api/products/categories', { category: category }).then(function (result) {
            $scope.altCategory = "Alternative: " + category;
            $scope.alternatives = result.data;
        });
    };

    $scope.swap = function (item) {
        if (!$scope.wantToAdd) {
            $scope.mainPackage[$scope.mainPackage.indexOf($scope.currentItem)] = item;
            $scope.currentItem = item;
        } else {
            $scope.mainPackage.push(item);
        }
    };
});
'use strict';

// States
// -- all products
app.config(function ($stateProvider) {
    $stateProvider.state('products', {
        url: '/products',
        templateUrl: 'js/products/products.html',
        controller: 'ProductsCtrl',
        resolve: {
            products: function products(ProductFactory) {
                return ProductFactory.fetchAllByCategory();
            }
        }
    });
});

// -- specific product
app.config(function ($stateProvider) {
    $stateProvider.state('product', {
        url: '/products/:productId',
        templateUrl: 'js/products/product.html',
        controller: 'ProductCtrl',
        resolve: {
            product: function product(ProductFactory, $stateParams) {
                return ProductFactory.fetchById($stateParams.productId);
            }
        }
    });
});

// Controllers
// -- all products
app.controller('ProductsCtrl', function ($scope, products) {
    $scope.products = products;
    console.log(products);
});

// -- specific product
app.controller('ProductCtrl', function ($scope, product) {
    $scope.product = product;
});

'use strict';

// app.factory('OrderFactory', function($http, )
'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'js/profile/profile.html',
        controller: 'ProfileCtrl'
    });
});

app.controller('ProfileCtrl', function ($scope, AuthService) {
    AuthService.getLoggedInUser().then(function (user) {
        $scope.user = user;
    });

    $scope.orders = [{ title: "Order Title 1" }, { title: "Order Title 2" }];

    $scope.reviews = [{ //to be pulled by client
        product: 'North Face Titanium Tent',
        review: 'This was excellent',
        rating: 5
    }, {
        product: 'Black Backpack',
        review: 'Did not like material',
        rating: new Array(4)
    }];
});
'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', function ($scope, AuthService, $state) {

    $scope.newUser = {};
    $scope.error = null;

    $scope.sendSignup = function (signupInfo) {

        $scope.error = null;
        if (signupInfo.password !== signupInfo.passwordagain) {
            $scope.error = 'Passwords do not match.';
            return;
        }
        AuthService.signup(signupInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid credentials.';
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('survey', {
        url: '/survey/:choice',
        templateUrl: 'js/survey/survey.html',
        controller: 'SurveyCtrl'
    });
});

app.controller('SurveyCtrl', function ($state, $scope, $stateParams) {

    $(document).ready(function () {
        $(".difSelect").on('click', function () {
            if ($(this).hasClass('selected')) {
                $(".difSelect").removeClass('selected');
            } else {
                $(".difSelect").removeClass('selected');
                $(this).addClass('selected');
            }
        });
        $(".tempSelect").on('click', function () {
            if ($(this).hasClass('selected')) {
                $(".tempSelect").removeClass('selected');
            } else {
                $(".tempSelect").removeClass('selected');
                $(this).addClass('selected');
            }
        });
        $(".lenSelect").on('click', function () {
            if ($(this).hasClass('selected')) {
                $(".lenSelect").removeClass('selected');
            } else {
                $(".lenSelect").removeClass('selected');
                $(this).addClass('selected');
            }
        });
    });

    $scope.goToPackage = function () {
        var arr = [$stateParams.choice],
            qArr = ['.diff', '.temp', '.length'];
        for (var i = 0; i < qArr.length; i++) {
            if ($(qArr[i] + ' .selected').length) {
                arr.push($(qArr[i] + ' .selected')[0].innerHTML);
            } else {
                arr.push("blank");
            }
        }
        $state.go('package', { selection: arr });
    };
});

'use strict';

app.factory('User', function ($http) {
    function User(props) {
        angular.extend(this, props);
    }

    User.url = '/api/users/';

    User.prototype.getUrl = function () {
        return User.url + this.id;
    };

    User.prototype.isNew = function () {
        return !this.id;
    };

    User.prototype.fetch = function () {
        return $http.get(this.getUrl()).then(function (res) {
            var user = new User(res.data);
            // user.orders = user.orders.map(function (obj) {
            //   return new Order(obj);
            // });
            return user;
        });
    };

    User.fetchAll = function () {
        return $http.get(User.url).then(function (res) {
            return res.data.map(function (obj) {
                return new User(obj);
            });
        });
    };

    User.prototype.save = function () {
        var verb;
        var url;
        if (this.isNew()) {
            verb = 'post';
            url = User.url;
        } else {
            verb = 'put';
            url = this.getUrl();
        }
        return $http[verb](url, this).then(function (res) {
            return new User(res.data);
        });
    };

    User.prototype.destroy = function () {
        return $http.delete(this.getUrl());
    };

    return User;
});

'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('users', {
        url: '/users',
        templateUrl: 'js/user/user.list.html',
        controller: 'UserListCtrl',
        resolve: {
            currentUser: function currentUser(AuthService) {
                return AuthService.refreshMe().then(function (me) {
                    if (!me.id) throw Error('Not logged in');else return me;
                });
            },
            users: function users(User) {
                return User.fetchAll();
            }
        }
    });
});

app.controller('UserListCtrl', function ($scope, users, User) {
    $scope.users = users;
    $scope.addUser = function () {
        $scope.userAdd.save().then(function (user) {
            $scope.userAdd = new User();
            $scope.users.unshift(user);
        });
    };

    $scope.userSearch = new User();

    $scope.userAdd = new User();
});

app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.factory('ProductFactory', function ($http) {

    var productUrl = '/api/products/';

    // converts an array of product objects to a nested object where
    //  key = category type
    //  value = array of objects matching that category
    var categorize = function categorize(products) {
        var categorizedProducts = {};
        products.forEach(function (product) {
            if (!categorizedProducts[product.category]) categorizedProducts[product.category] = [];
            categorizedProducts[product.category].push(product);
        });
        return categorizedProducts;
    };

    return {

        // all products in an unsorted array
        fetchAll: function fetchAll() {
            return $http.get(productUrl).then(function (res) {
                return res.data;
            });
        },

        // all products, split by category in a nested object
        fetchAllByCategory: function fetchAllByCategory() {
            return $http.get(productUrl).then(function (res) {
                return categorize(res.data);
            });
        },

        // single product by ID
        fetchById: function fetchById(id) {
            return $http.get(productUrl + id).then(function (res) {
                return res.data;
            });
        },

        // all products under a specified category, in an unsorted array
        fetchByCategory: function fetchByCategory(category) {
            return $http.get(productUrl + 'categories/' + category).then(function (res) {
                return res.data;
            });
        }

    };
});

app.directive('oauthButton', function () {
    return {
        scope: {
            providerName: '@'
        },
        restrict: 'E',
        templateUrl: '/js/common/oauth-button/oauth-button.html'
    };
});

app.directive('bearnorthLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/bearnorth-logo/bearnorth-logo.html'
    };
});

app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Users', state: 'users' }, { label: 'Orders', state: 'orders' }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});

app.directive('productCatalogListing', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/products/product-catalog-listing.html',
        scope: {
            product: '='
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJkb2NzL2RvY3MuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJwYWNrYWdlL3BhY2thZ2UuanMiLCJwcm9kdWN0cy9wcm9kdWN0cy5qcyIsInByb2ZpbGUvb3JkZXJzLmpzIiwicHJvZmlsZS9wcm9maWxlLmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInN1cnZleS9zdXJ2ZXkuanMiLCJ1c2VyL3VzZXIuZmFjdG9yeS5qcyIsInVzZXIvdXNlci5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9wcm9kdWN0LmZhY3RvcnkuanMiLCJjb21tb24vb2F1dGgtYnV0dG9uL29hdXRoLWJ1dHRvbi5kaXJlY3RpdmUuanMiLCJjb21tb24vZGlyZWN0aXZlcy9iZWFybm9ydGgtbG9nby9iZWFybm9ydGgtbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9wcm9kdWN0cy9wcm9kdWN0LmRpcmVjdGl2ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQ0EsT0FBQSxHQUFBLEdBQUEsUUFBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHNCQUFBLFNBQUEsQ0FBQSxJQUFBOztBQUVBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBOztBQUVBLHVCQUFBLElBQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLFFBQUEsQ0FBQSxNQUFBO0FBQ0EsS0FGQTtBQUdBLENBVEE7OztBQVlBLElBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsK0JBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxJQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsWUFBQTtBQUNBLEtBRkE7Ozs7QUFNQSxlQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDZCQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQTtBQUNBOztBQUVBLFlBQUEsWUFBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0E7QUFDQTs7O0FBR0EsY0FBQSxjQUFBOztBQUVBLG9CQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsUUFBQSxJQUFBLEVBQUEsUUFBQTtBQUNBLGFBRkEsTUFFQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxPQUFBO0FBQ0E7QUFDQSxTQVRBO0FBV0EsS0E1QkE7QUE4QkEsQ0F2Q0E7O0FDZkEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxvQkFBQSxpQkFGQTtBQUdBLHFCQUFBO0FBSEEsS0FBQTtBQU1BLENBVEE7O0FBV0EsSUFBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFdBQUEsTUFBQSxHQUFBLEVBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUVBLENBTEE7QUNYQSxDQUFBLFlBQUE7O0FBRUE7Ozs7QUFHQSxRQUFBLENBQUEsT0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBOztBQUVBLFFBQUEsTUFBQSxRQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxFQUFBLENBQUEsT0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsS0FIQTs7Ozs7QUFRQSxRQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxzQkFBQSxvQkFEQTtBQUVBLHFCQUFBLG1CQUZBO0FBR0EsdUJBQUEscUJBSEE7QUFJQSx3QkFBQSxzQkFKQTtBQUtBLDBCQUFBLHdCQUxBO0FBTUEsdUJBQUE7QUFOQSxLQUFBOztBQVNBLFFBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsYUFBQTtBQUNBLGlCQUFBLFlBQUEsZ0JBREE7QUFFQSxpQkFBQSxZQUFBLGFBRkE7QUFHQSxpQkFBQSxZQUFBLGNBSEE7QUFJQSxpQkFBQSxZQUFBO0FBSkEsU0FBQTtBQU1BLGVBQUE7QUFDQSwyQkFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwyQkFBQSxVQUFBLENBQUEsV0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUE7QUFDQTtBQUpBLFNBQUE7QUFNQSxLQWJBOztBQWVBLFFBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFdBREEsRUFFQSxVQUFBLFNBQUEsRUFBQTtBQUNBLG1CQUFBLFVBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUE7QUFDQSxTQUpBLENBQUE7QUFNQSxLQVBBOztBQVNBLFFBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBLFNBQUEsSUFBQTtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxLQUFBLElBQUE7QUFDQSx1QkFBQSxVQUFBLENBQUEsWUFBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxJQUFBO0FBQ0E7Ozs7QUFJQSxhQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLFFBQUEsSUFBQTtBQUNBLFNBRkE7O0FBSUEsYUFBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxLQUFBLGVBQUEsTUFBQSxlQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEdBQUEsSUFBQSxDQUFBLFFBQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7O0FBS0EsbUJBQUEsTUFBQSxHQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxpQkFBQSxFQUFBLEtBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsSUFBQTtBQUNBLGFBRkEsQ0FBQTtBQUlBLFNBckJBOztBQXVCQSxhQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLE1BQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLEVBQ0EsSUFEQSxDQUNBLGlCQURBLEVBRUEsS0FGQSxDQUVBLFlBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLFNBQUEsNEJBQUEsRUFBQSxDQUFBO0FBQ0EsYUFKQSxDQUFBO0FBS0EsU0FOQTs7QUFTQSxhQUFBLE1BQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLE1BQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxXQUFBLEVBQ0EsSUFEQSxDQUNBLGlCQURBLEVBRUEsS0FGQSxDQUVBLFlBQUE7QUFDQSx1QkFBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLFNBQUEsNEJBQUEsRUFBQSxDQUFBO0FBQ0EsYUFKQSxDQUFBO0FBS0EsU0FOQTs7QUFRQSxhQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsTUFBQSxHQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esd0JBQUEsT0FBQTtBQUNBLDJCQUFBLFVBQUEsQ0FBQSxZQUFBLGFBQUE7QUFDQSxhQUhBLENBQUE7QUFJQSxTQUxBO0FBT0EsS0E5REE7O0FBZ0VBLFFBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUE7O0FBRUEsbUJBQUEsR0FBQSxDQUFBLFlBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsaUJBQUEsT0FBQTtBQUNBLFNBRkE7O0FBSUEsbUJBQUEsR0FBQSxDQUFBLFlBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxpQkFBQSxPQUFBO0FBQ0EsU0FGQTs7QUFJQSxhQUFBLEVBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTs7QUFFQSxhQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsU0FBQTtBQUNBLGlCQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FIQTs7QUFLQSxhQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBLElBQUE7QUFDQSxpQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLFNBSEE7QUFLQSxLQXpCQTtBQTJCQSxDQTdJQTs7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLE9BREE7QUFFQSxxQkFBQTtBQUZBLEtBQUE7QUFJQSxDQUxBOztBQ0FBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsR0FEQTtBQUVBLHFCQUFBLG1CQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxJQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFdBQUEsVUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLE1BQUE7QUFDQSxZQUFBLFNBQUEsU0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsRUFBQSxRQUFBLE1BQUEsRUFBQTtBQUNBLEtBSkE7QUFNQSxDQVJBOztBQ1JBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxxQkFBQSxxQkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQU1BLENBUkE7O0FBVUEsSUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxHQUFBLElBQUE7O0FBRUEsV0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsZUFBQSxLQUFBLEdBQUEsSUFBQTtBQUNBLG9CQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxtQkFBQSxFQUFBLENBQUEsTUFBQTtBQUNBLFNBRkEsRUFFQSxLQUZBLENBRUEsWUFBQTtBQUNBLG1CQUFBLEtBQUEsR0FBQSw0QkFBQTtBQUNBLFNBSkE7QUFNQSxLQVRBO0FBV0EsQ0FoQkE7QUNWQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsYUFBQSxlQURBO0FBRUEsa0JBQUEsbUVBRkE7QUFHQSxvQkFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0Esd0JBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHVCQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFGQTtBQUdBLFNBUEE7OztBQVVBLGNBQUE7QUFDQSwwQkFBQTtBQURBO0FBVkEsS0FBQTtBQWVBLENBakJBOztBQW1CQSxJQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSwyQkFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFNBQUEsSUFBQTtBQUNBLFNBRkEsQ0FBQTtBQUdBLEtBSkE7O0FBTUEsV0FBQTtBQUNBLGtCQUFBO0FBREEsS0FBQTtBQUlBLENBWkE7QUNuQkEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxxQkFEQTtBQUVBLHFCQUFBLHlCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxJQUFBLFVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLFlBQUEsYUFBQSxTQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxXQUFBLFFBQUEsR0FBQSxTQUFBOztBQUVBLFFBQUEsV0FBQTtBQUNBLGtCQUFBLFVBQUEsQ0FBQSxDQURBO0FBRUEsb0JBQUEsVUFBQSxDQUFBLENBRkE7QUFHQSxpQkFBQSxVQUFBLENBQUEsQ0FIQTtBQUlBLHFCQUFBLFVBQUEsQ0FBQTtBQUpBLEtBQUE7O0FBT0EsVUFBQSxHQUFBLENBQUEsNkJBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLFVBQUEsR0FBQSxPQUFBLElBQUE7QUFDQSxLQUhBOztBQUtBLFVBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsRUFBQSxRQUFBLFFBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsV0FBQSxHQUFBLE9BQUEsSUFBQTtBQUNBLGVBQUEsVUFBQSxHQUFBLE1BQUEsT0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsRUFBQSxjQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBO0FBQ0EsU0FIQSxFQUdBLENBSEEsRUFHQSxPQUhBLENBR0EsQ0FIQSxDQUFBO0FBSUEsZUFBQSxXQUFBLEdBQUEsTUFBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsT0FBQSxFQUFBLFlBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUE7QUFDQSxTQUhBLEVBR0EsQ0FIQSxFQUdBLE9BSEEsQ0FHQSxDQUhBLENBQUE7QUFJQSxLQVhBOztBQWFBLFdBQUEsT0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLEdBQUEsS0FBQTtBQUNBLGVBQUEsV0FBQSxHQUFBLElBQUE7QUFDQSxjQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLEVBQUEsVUFBQSxLQUFBLFFBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLE1BQUEsRUFBQTtBQUNBLG1CQUFBLFdBQUEsR0FBQSxrQkFBQSxLQUFBLFFBQUE7QUFDQSxtQkFBQSxZQUFBLEdBQUEsT0FBQSxJQUFBO0FBQ0EsU0FKQTtBQUtBLEtBUkE7O0FBVUEsV0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsV0FBQSxTQUFBLGNBQUEsQ0FBQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUEsRUFBQSxVQUFBLFFBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLE1BQUEsRUFBQTtBQUNBLG1CQUFBLFdBQUEsR0FBQSxrQkFBQSxRQUFBO0FBQ0EsbUJBQUEsWUFBQSxHQUFBLE9BQUEsSUFBQTtBQUNBLFNBSkE7QUFLQSxLQVBBOztBQVNBLFdBQUEsSUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsV0FBQSxDQUFBLE9BQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLFdBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQSxtQkFBQSxXQUFBLEdBQUEsSUFBQTtBQUNBLFNBSEEsTUFJQTtBQUNBLG1CQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBO0FBQ0EsS0FSQTtBQVNBLENBMURBO0FDUkE7Ozs7QUFJQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSwyQkFGQTtBQUdBLG9CQUFBLGNBSEE7QUFJQSxpQkFBQTtBQUNBLHNCQUFBLGtCQUFBLGNBQUEsRUFBQTtBQUNBLHVCQUFBLGVBQUEsa0JBQUEsRUFBQTtBQUNBO0FBSEE7QUFKQSxLQUFBO0FBVUEsQ0FYQTs7O0FBY0EsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxzQkFEQTtBQUVBLHFCQUFBLDBCQUZBO0FBR0Esb0JBQUEsYUFIQTtBQUlBLGlCQUFBO0FBQ0EscUJBQUEsaUJBQUEsY0FBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLHVCQUFBLGVBQUEsU0FBQSxDQUFBLGFBQUEsU0FBQSxDQUFBO0FBQ0E7QUFIQTtBQUpBLEtBQUE7QUFVQSxDQVhBOzs7O0FBZUEsSUFBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxZQUFBLEdBQUEsQ0FBQSxRQUFBO0FBQ0EsQ0FIQTs7O0FBTUEsSUFBQSxVQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxDQUZBOztBQ3ZDQTs7O0FDQUE7O0FBRUEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsVUFEQTtBQUVBLHFCQUFBLHlCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBTUEsQ0FSQTs7QUFVQSxJQUFBLFVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsZ0JBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxLQUZBOztBQUtBLFdBQUEsTUFBQSxHQUFBLENBQ0EsRUFBQSxPQUFBLGVBQUEsRUFEQSxFQUVBLEVBQUEsT0FBQSxlQUFBLEVBRkEsQ0FBQTs7QUFLQSxXQUFBLE9BQUEsR0FBQSxDQUFBLEU7QUFDQSxpQkFBQSwwQkFEQTtBQUVBLGdCQUFBLG9CQUZBO0FBR0EsZ0JBQUE7QUFIQSxLQUFBLEVBSUE7QUFDQSxpQkFBQSxnQkFEQTtBQUVBLGdCQUFBLHVCQUZBO0FBR0EsZ0JBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQTtBQUhBLEtBSkEsQ0FBQTtBQVNBLENBcEJBO0FDWkE7O0FBRUEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FEQTtBQUVBLHFCQUFBLHVCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBTUEsQ0FSQTs7QUFVQSxJQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLEdBQUEsSUFBQTs7QUFFQSxXQUFBLFVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7QUFFQSxlQUFBLEtBQUEsR0FBQSxJQUFBO0FBQ0EsWUFBQSxXQUFBLFFBQUEsS0FBQSxXQUFBLGFBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsR0FBQSx5QkFBQTtBQUNBO0FBQ0E7QUFDQSxvQkFBQSxNQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsbUJBQUEsRUFBQSxDQUFBLE1BQUE7QUFDQSxTQUZBLEVBRUEsS0FGQSxDQUVBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLEdBQUEsc0JBQUE7QUFDQSxTQUpBO0FBTUEsS0FiQTtBQWVBLENBcEJBO0FDWkEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLHVCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFTQSxJQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxNQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsWUFBQTtBQUNBLFVBQUEsWUFBQSxFQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGFBRkEsTUFHQTtBQUNBLGtCQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGtCQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsVUFBQTtBQUNBO0FBQ0EsU0FSQTtBQVNBLFVBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLGFBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGFBRkEsTUFHQTtBQUNBLGtCQUFBLGFBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGtCQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsVUFBQTtBQUNBO0FBQ0EsU0FSQTtBQVNBLFVBQUEsWUFBQSxFQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGFBRkEsTUFHQTtBQUNBLGtCQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsVUFBQTtBQUNBLGtCQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsVUFBQTtBQUNBO0FBQ0EsU0FSQTtBQVNBLEtBNUJBOztBQThCQSxXQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxNQUFBLENBQUEsYUFBQSxNQUFBLENBQUE7WUFBQSxPQUFBLENBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxTQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEtBQUEsQ0FBQSxJQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsSUFBQSxZQUFBLEVBQUEsQ0FBQSxFQUFBLFNBQUE7QUFDQSxhQUZBLE1BR0E7QUFDQSxvQkFBQSxJQUFBLENBQUEsT0FBQTtBQUNBO0FBQ0E7QUFDQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQSxXQUFBLEdBQUEsRUFBQTtBQUNBLEtBWEE7QUFhQSxDQTdDQTs7QUNUQTs7QUFFQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxhQUFBOztBQUVBLFNBQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxLQUFBLEdBQUEsR0FBQSxLQUFBLEVBQUE7QUFDQSxLQUZBOztBQUlBLFNBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLEtBRkE7O0FBSUEsU0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsTUFBQSxFQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQTs7OztBQUlBLG1CQUFBLElBQUE7QUFDQSxTQVBBLENBQUE7QUFRQSxLQVRBOztBQVdBLFNBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHVCQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLFNBTEEsQ0FBQTtBQU1BLEtBUEE7O0FBU0EsU0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLElBQUE7QUFDQSxZQUFBLEdBQUE7QUFDQSxZQUFBLEtBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxNQUFBO0FBQ0Esa0JBQUEsS0FBQSxHQUFBO0FBQ0EsU0FIQSxNQUdBO0FBQ0EsbUJBQUEsS0FBQTtBQUNBLGtCQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0E7QUFDQSxlQUFBLE1BQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUE7QUFDQSxTQUhBLENBQUE7QUFJQSxLQWRBOztBQWdCQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsTUFBQSxNQUFBLENBQUEsS0FBQSxNQUFBLEVBQUEsQ0FBQTtBQUNBLEtBRkE7O0FBSUEsV0FBQSxJQUFBO0FBQ0EsQ0F4REE7O0FDRkE7O0FBRUEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FB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QSxPQUFBLE9BQUEsRUFBQSxPQUFBLE9BQUEsRUFEQSxFQUVBLEVBQUEsT0FBQSxRQUFBLEVBQUEsT0FBQSxRQUFBLEVBRkEsQ0FBQTs7QUFLQSxrQkFBQSxJQUFBLEdBQUEsSUFBQTs7QUFFQSxrQkFBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLFlBQUEsZUFBQSxFQUFBO0FBQ0EsYUFGQTs7QUFJQSxrQkFBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLDRCQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLDJCQUFBLEVBQUEsQ0FBQSxNQUFBO0FBQ0EsaUJBRkE7QUFHQSxhQUpBOztBQU1BLGdCQUFBLFVBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSw0QkFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMEJBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxpQkFGQTtBQUdBLGFBSkE7O0FBTUEsZ0JBQUEsYUFBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHNCQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFGQTs7QUFJQTs7QUFFQSx1QkFBQSxHQUFBLENBQUEsWUFBQSxZQUFBLEVBQUEsT0FBQTtBQUNBLHVCQUFBLEdBQUEsQ0FBQSxZQUFBLGFBQUEsRUFBQSxVQUFBO0FBQ0EsdUJBQUEsR0FBQSxDQUFBLFlBQUEsY0FBQSxFQUFBLFVBQUE7QUFFQTs7QUF2Q0EsS0FBQTtBQTJDQSxDQTdDQTs7QUNBQSxJQUFBLFNBQUEsQ0FBQSx1QkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0Esa0JBQUEsR0FEQTtBQUVBLHFCQUFBLDREQUZBO0FBR0EsZUFBQTtBQUNBLHFCQUFBO0FBREE7QUFIQSxLQUFBO0FBT0EsQ0FSQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uIChmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHsgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJyB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuc2lnbnVwID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL3NpZ251cCcsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG9jcycsIHtcbiAgICAgICAgdXJsOiAnL2RvY3MnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RvY3MvZG9jcy5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsJHNjb3BlKXtcblx0XG5cdCRzY29wZS5nb1RvU3VydmV5ID0gZnVuY3Rpb24oYWN0aXZpdHkpe1xuXHRcdGNvbnNvbGUubG9nKFwiaGVyZVwiKTtcblx0XHR2YXIgY2hvaWNlID0gYWN0aXZpdHkudGFyZ2V0LmZpcnN0Q2hpbGQuZGF0YTtcblx0XHQkc3RhdGUuZ28oJ3N1cnZleScse2Nob2ljZTogY2hvaWNlfSk7XG5cdH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGFja2FnZScsIHtcbiAgICAgICAgdXJsOiAnL3BhY2thZ2UvOnNlbGVjdGlvbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvcGFja2FnZS9wYWNrYWdlLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGFja2FnZUN0cmwnXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1BhY2thZ2VDdHJsJyxmdW5jdGlvbigkc3RhdGUsJHNjb3BlLCRzdGF0ZVBhcmFtcywkaHR0cCl7XG5cdHZhciBzZWxlY3RPYmo9JHN0YXRlUGFyYW1zLnNlbGVjdGlvbi5zcGxpdCgnLCcpO1xuXHRcblx0JHNjb3BlLmNyaXRlcmlhPXNlbGVjdE9iajtcblxuXHR2YXIgcXVlcnlPYmogPSB7XG5cdFx0YWN0aXZpdHk6IHNlbGVjdE9ialswXSxcblx0XHRkaWZmaWN1bHR5OiBzZWxlY3RPYmpbMV0sXG5cdFx0Y2xpbWF0ZTogc2VsZWN0T2JqWzJdLFxuXHRcdHRyaXBfbGVuZ3RoOiBzZWxlY3RPYmpbM10sXG5cdH07XG5cblx0JGh0dHAuZ2V0KCcvYXBpL3Byb2R1Y3RzL2FsbENhdGVnb3JpZXMnKVxuXHQudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuXHRcdCRzY29wZS5jYXRlZ29yaWVzID0gcmVzdWx0LmRhdGE7XG5cdH0pXHRcblxuXHQkaHR0cC5nZXQoJy9hcGkvYm94ZXMvbWF0Y2gnLHtwYXJhbXM6IHF1ZXJ5T2JqfSlcblx0LnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcblx0XHQkc2NvcGUubWFpblBhY2thZ2U9cmVzdWx0LmRhdGE7XG5cdFx0JHNjb3BlLnRvdGFsUHJpY2U9IFwiJFwiK3Jlc3VsdC5kYXRhLnJlZHVjZShmdW5jdGlvbihhLGIpe1xuXHRcdFx0YSs9TnVtYmVyKGIucHVyY2hhc2VfcHJpY2UpO1xuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwwKS50b0ZpeGVkKDIpO1xuXHRcdCRzY29wZS5yZW50YWxQcmljZT0gXCIkXCIrcmVzdWx0LmRhdGEucmVkdWNlKGZ1bmN0aW9uKGEsYil7XG5cdFx0XHRhKz1OdW1iZXIoYi5yZW50YWxfcHJpY2UpO1xuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwwKS50b0ZpeGVkKDIpO1xuXHR9KVxuXG5cdCRzY29wZS5zZWVNb3JlPWZ1bmN0aW9uKGl0ZW0pe1xuXHRcdCRzY29wZS53YW50VG9BZGQ9ZmFsc2U7XG5cdFx0JHNjb3BlLmN1cnJlbnRJdGVtPWl0ZW07XG5cdFx0JGh0dHAucG9zdCgnL2FwaS9wcm9kdWN0cy9jYXRlZ29yaWVzJywge2NhdGVnb3J5OiBpdGVtLmNhdGVnb3J5fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuXHRcdFx0JHNjb3BlLmFsdENhdGVnb3J5PVwiQWx0ZXJuYXRpdmU6IFwiK2l0ZW0uY2F0ZWdvcnk7XG5cdFx0XHQkc2NvcGUuYWx0ZXJuYXRpdmVzID0gcmVzdWx0LmRhdGE7XG5cdFx0fSlcblx0fVxuXG5cdCRzY29wZS5zZWVNb3JlT3B0aW9ucz1mdW5jdGlvbigpe1xuXHQgICAgdmFyIGNhdGVnb3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpb25CYXJcIikudmFsdWU7XG5cdFx0JGh0dHAucG9zdCgnL2FwaS9wcm9kdWN0cy9jYXRlZ29yaWVzJywge2NhdGVnb3J5OiBjYXRlZ29yeX0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcblx0XHRcdCRzY29wZS5hbHRDYXRlZ29yeT1cIkFsdGVybmF0aXZlOiBcIitjYXRlZ29yeTtcblx0XHRcdCRzY29wZS5hbHRlcm5hdGl2ZXMgPSByZXN1bHQuZGF0YTtcblx0XHR9KVxuXHR9XG5cblx0JHNjb3BlLnN3YXA9ZnVuY3Rpb24oaXRlbSl7XG5cdFx0aWYoISRzY29wZS53YW50VG9BZGQpe1xuXHRcdFx0JHNjb3BlLm1haW5QYWNrYWdlWyRzY29wZS5tYWluUGFja2FnZS5pbmRleE9mKCRzY29wZS5jdXJyZW50SXRlbSldPWl0ZW07XG5cdFx0XHQkc2NvcGUuY3VycmVudEl0ZW09aXRlbTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQkc2NvcGUubWFpblBhY2thZ2UucHVzaChpdGVtKTtcblx0XHR9XG5cdH1cbn0pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBTdGF0ZXNcbi8vIC0tIGFsbCBwcm9kdWN0c1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdHMnLCB7XG4gICAgICAgIHVybDogJy9wcm9kdWN0cycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvcHJvZHVjdHMvcHJvZHVjdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0c0N0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZmV0Y2hBbGxCeUNhdGVnb3J5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuLy8gLS0gc3BlY2lmaWMgcHJvZHVjdFxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdCcsIHtcbiAgICAgICAgdXJsOiAnL3Byb2R1Y3RzLzpwcm9kdWN0SWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Byb2R1Y3RzL3Byb2R1Y3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0Q3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBwcm9kdWN0OiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZmV0Y2hCeUlkKCRzdGF0ZVBhcmFtcy5wcm9kdWN0SWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8vIENvbnRyb2xsZXJzXG4vLyAtLSBhbGwgcHJvZHVjdHNcbmFwcC5jb250cm9sbGVyKCdQcm9kdWN0c0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBwcm9kdWN0cykge1xuICAkc2NvcGUucHJvZHVjdHMgPSBwcm9kdWN0cztcbiAgY29uc29sZS5sb2cocHJvZHVjdHMpXG59KTtcblxuLy8gLS0gc3BlY2lmaWMgcHJvZHVjdFxuYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3RDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgcHJvZHVjdCkge1xuICAkc2NvcGUucHJvZHVjdCA9IHByb2R1Y3Q7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gYXBwLmZhY3RvcnkoJ09yZGVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCApIiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2ZpbGUnLCB7XG4gICAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wcm9maWxlL3Byb2ZpbGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQcm9maWxlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlKSB7XG5cdEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICBcdCRzY29wZS51c2VyID0gdXNlcjtcbiAgICB9KTtcblxuXG5cdCRzY29wZS5vcmRlcnM9W1xuXHR7dGl0bGU6XCJPcmRlciBUaXRsZSAxXCJ9LFxuXHR7dGl0bGU6XCJPcmRlciBUaXRsZSAyXCJ9LFxuXHRdO1xuXG5cdCRzY29wZS5yZXZpZXdzPVt7IC8vdG8gYmUgcHVsbGVkIGJ5IGNsaWVudFxuXHRcdHByb2R1Y3Q6ICdOb3J0aCBGYWNlIFRpdGFuaXVtIFRlbnQnLCBcblx0XHRyZXZpZXc6ICdUaGlzIHdhcyBleGNlbGxlbnQnLFxuXHRcdHJhdGluZzogNVxuXHR9LCB7XG5cdFx0cHJvZHVjdDogJ0JsYWNrIEJhY2twYWNrJyxcblx0XHRyZXZpZXc6ICdEaWQgbm90IGxpa2UgbWF0ZXJpYWwnLFxuXHRcdHJhdGluZzogbmV3IEFycmF5KDQpXG5cdH1dO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2lnbnVwL3NpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NpZ251cEN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2lnbnVwQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5uZXdVc2VyID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kU2lnbnVwID0gZnVuY3Rpb24gKHNpZ251cEluZm8pIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICAgIGlmIChzaWdudXBJbmZvLnBhc3N3b3JkICE9PSBzaWdudXBJbmZvLnBhc3N3b3JkYWdhaW4pIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgQXV0aFNlcnZpY2Uuc2lnbnVwKHNpZ251cEluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VydmV5Jywge1xuICAgICAgICB1cmw6ICcvc3VydmV5LzpjaG9pY2UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1cnZleS9zdXJ2ZXkuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTdXJ2ZXlDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N1cnZleUN0cmwnLGZ1bmN0aW9uKCRzdGF0ZSwkc2NvcGUsJHN0YXRlUGFyYW1zKXtcblx0XG5cdCQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cdFx0JChcIi5kaWZTZWxlY3RcIikub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKCQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpe1xuXHRcdFx0XHQkKFwiLmRpZlNlbGVjdFwiKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHQkKFwiLmRpZlNlbGVjdFwiKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkKFwiLnRlbXBTZWxlY3RcIikub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKCQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpe1xuXHRcdFx0XHQkKFwiLnRlbXBTZWxlY3RcIikucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0JChcIi50ZW1wU2VsZWN0XCIpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCQoXCIubGVuU2VsZWN0XCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRpZigkKHRoaXMpLmhhc0NsYXNzKCdzZWxlY3RlZCcpKXtcblx0XHRcdFx0JChcIi5sZW5TZWxlY3RcIikucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0JChcIi5sZW5TZWxlY3RcIikucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pXG5cdFxuXHQkc2NvcGUuZ29Ub1BhY2thZ2UgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBhcnI9WyRzdGF0ZVBhcmFtcy5jaG9pY2VdLCBxQXJyPVsnLmRpZmYnLCcudGVtcCcsJy5sZW5ndGgnXTtcblx0XHRmb3IgKHZhciBpPTA7IGk8cUFyci5sZW5ndGg7IGkrKyl7XG5cdFx0XHRpZigkKHFBcnJbaV0rJyAuc2VsZWN0ZWQnKS5sZW5ndGgpe1xuXHRcdFx0XHRhcnIucHVzaCgkKHFBcnJbaV0rJyAuc2VsZWN0ZWQnKVswXS5pbm5lckhUTUwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGFyci5wdXNoKFwiYmxhbmtcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzdGF0ZS5nbygncGFja2FnZScsIHtzZWxlY3Rpb246IGFycn0pO1xuXHR9XG5cbn0pXG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmZhY3RvcnkoJ1VzZXInLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgZnVuY3Rpb24gVXNlciAocHJvcHMpIHtcbiAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCBwcm9wcyk7XG4gIH1cblxuICBVc2VyLnVybCA9ICcvYXBpL3VzZXJzLyc7XG5cbiAgVXNlci5wcm90b3R5cGUuZ2V0VXJsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBVc2VyLnVybCArIHRoaXMuaWQ7XG4gIH07XG5cbiAgVXNlci5wcm90b3R5cGUuaXNOZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlkXG4gIH07XG5cbiAgVXNlci5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICRodHRwLmdldCh0aGlzLmdldFVybCgpKVxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHZhciB1c2VyID0gbmV3IFVzZXIocmVzLmRhdGEpO1xuICAgICAgLy8gdXNlci5vcmRlcnMgPSB1c2VyLm9yZGVycy5tYXAoZnVuY3Rpb24gKG9iaikge1xuICAgICAgLy8gICByZXR1cm4gbmV3IE9yZGVyKG9iaik7XG4gICAgICAvLyB9KTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH0pO1xuICB9O1xuXG4gIFVzZXIuZmV0Y2hBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICRodHRwLmdldChVc2VyLnVybClcbiAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmRhdGEubWFwKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKG9iaik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBVc2VyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2ZXJiO1xuICAgIHZhciB1cmw7XG4gICAgaWYgKHRoaXMuaXNOZXcoKSkge1xuICAgICAgdmVyYiA9ICdwb3N0JztcbiAgICAgIHVybCA9IFVzZXIudXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2ZXJiID0gJ3B1dCc7XG4gICAgICB1cmwgPSB0aGlzLmdldFVybCgpO1xuICAgIH1cbiAgICByZXR1cm4gJGh0dHBbdmVyYl0odXJsLCB0aGlzKVxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHJldHVybiBuZXcgVXNlcihyZXMuZGF0YSk7XG4gICAgfSk7XG4gIH07XG5cbiAgVXNlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJGh0dHAuZGVsZXRlKHRoaXMuZ2V0VXJsKCkpO1xuICB9O1xuXG4gIHJldHVybiBVc2VyO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VycycsIHtcbiAgICB1cmw6ICcvdXNlcnMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvdXNlci91c2VyLmxpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1VzZXJMaXN0Q3RybCcsXG4gICAgcmVzb2x2ZToge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uIChBdXRoU2VydmljZSkge1xuICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UucmVmcmVzaE1lKClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1lKSB7XG4gICAgICAgICAgaWYgKCFtZS5pZCkgdGhyb3cgRXJyb3IoJ05vdCBsb2dnZWQgaW4nKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBtZTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXNlcnM6IGZ1bmN0aW9uIChVc2VyKSB7XG4gICAgICAgIHJldHVybiBVc2VyLmZldGNoQWxsKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignVXNlckxpc3RDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgdXNlcnMsIFVzZXIpIHtcbiAgJHNjb3BlLnVzZXJzID0gdXNlcnM7XG4gICRzY29wZS5hZGRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICRzY29wZS51c2VyQWRkLnNhdmUoKVxuICAgIC50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAkc2NvcGUudXNlckFkZCA9IG5ldyBVc2VyKCk7XG4gICAgICAkc2NvcGUudXNlcnMudW5zaGlmdCh1c2VyKTtcbiAgICB9KTtcbiAgfTtcbiAgXG4gICRzY29wZS51c2VyU2VhcmNoID0gbmV3IFVzZXIoKTtcblxuICAkc2NvcGUudXNlckFkZCA9IG5ldyBVc2VyKCk7XG59KTtcblxuIiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxuICAgICAgICAnSGVsbG8sIHNpbXBsZSBodW1hbi4nLFxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcbiAgICAgICAgJ1RoaXMgZW1wdHkgc3RyaW5nIGlzIGZvciBMaW5kc2F5IExldmluZS4nLFxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXG4gICAgICAgICc6RCcsXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXG4gICAgICAgICdJZiBDb29wZXIgY291bGQgb2ZmZXIgb25seSBvbmUgcGllY2Ugb2YgYWR2aWNlLCBpdCB3b3VsZCBiZSB0byBuZXZTUVVJUlJFTCEnLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1Byb2R1Y3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcblxuICB2YXIgcHJvZHVjdFVybCA9ICcvYXBpL3Byb2R1Y3RzLyc7XG5cbiAgLy8gY29udmVydHMgYW4gYXJyYXkgb2YgcHJvZHVjdCBvYmplY3RzIHRvIGEgbmVzdGVkIG9iamVjdCB3aGVyZVxuICAvLyAga2V5ID0gY2F0ZWdvcnkgdHlwZVxuICAvLyAgdmFsdWUgPSBhcnJheSBvZiBvYmplY3RzIG1hdGNoaW5nIHRoYXQgY2F0ZWdvcnlcbiAgdmFyIGNhdGVnb3JpemUgPSBmdW5jdGlvbihwcm9kdWN0cykge1xuICAgIHZhciBjYXRlZ29yaXplZFByb2R1Y3RzID0ge307XG4gICAgcHJvZHVjdHMuZm9yRWFjaCggZnVuY3Rpb24ocHJvZHVjdCkge1xuICAgICAgaWYoIWNhdGVnb3JpemVkUHJvZHVjdHNbcHJvZHVjdC5jYXRlZ29yeV0pIGNhdGVnb3JpemVkUHJvZHVjdHNbcHJvZHVjdC5jYXRlZ29yeV0gPSBbXTtcbiAgICAgIGNhdGVnb3JpemVkUHJvZHVjdHNbcHJvZHVjdC5jYXRlZ29yeV0ucHVzaChwcm9kdWN0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2F0ZWdvcml6ZWRQcm9kdWN0cztcbiAgfVxuXG4gIHJldHVybiB7XG5cbiAgICAvLyBhbGwgcHJvZHVjdHMgaW4gYW4gdW5zb3J0ZWQgYXJyYXlcbiAgICBmZXRjaEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCBwcm9kdWN0VXJsIClcbiAgICAgIC50aGVuKHJlcyA9PiByZXMuZGF0YSk7XG4gICAgfSxcblxuICAgIC8vIGFsbCBwcm9kdWN0cywgc3BsaXQgYnkgY2F0ZWdvcnkgaW4gYSBuZXN0ZWQgb2JqZWN0XG4gICAgZmV0Y2hBbGxCeUNhdGVnb3J5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoIHByb2R1Y3RVcmwgKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHJldHVybiBjYXRlZ29yaXplKHJlcy5kYXRhKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIHNpbmdsZSBwcm9kdWN0IGJ5IElEXG4gICAgZmV0Y2hCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCggcHJvZHVjdFVybCArIGlkKVxuICAgICAgLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbiAgICB9LFxuXG4gICAgLy8gYWxsIHByb2R1Y3RzIHVuZGVyIGEgc3BlY2lmaWVkIGNhdGVnb3J5LCBpbiBhbiB1bnNvcnRlZCBhcnJheVxuICAgIGZldGNoQnlDYXRlZ29yeTogZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoIHByb2R1Y3RVcmwgKyAnY2F0ZWdvcmllcy8nICsgY2F0ZWdvcnkpXG4gICAgICAudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuICAgIH0sXG5cblxuXG4gIH1cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnb2F1dGhCdXR0b24nLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgc2NvcGU6IHtcbiAgICAgIHByb3ZpZGVyTmFtZTogJ0AnXG4gICAgfSxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL2NvbW1vbi9vYXV0aC1idXR0b24vb2F1dGgtYnV0dG9uLmh0bWwnXG4gIH1cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnYmVhcm5vcnRoTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2JlYXJub3J0aC1sb2dvL2JlYXJub3J0aC1sb2dvLmh0bWwnXG4gICAgfTtcbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdVc2VycycsIHN0YXRlOiAndXNlcnMnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ09yZGVycycsIHN0YXRlOiAnb3JkZXJzJyB9LFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdwcm9kdWN0Q2F0YWxvZ0xpc3RpbmcnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcHJvZHVjdHMvcHJvZHVjdC1jYXRhbG9nLWxpc3RpbmcuaHRtbCcsXG4gICAgc2NvcGU6IHtcbiAgICAgIHByb2R1Y3Q6ICc9J1xuICAgIH1cbiAgfTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
