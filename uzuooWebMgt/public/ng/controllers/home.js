'use strict';

angular.module('myApp').controller('PermissionCtrl', ['$scope', '$location', '$rootScope',
    function ($scope, $location, $rootScope) {

        $rootScope.sideBarSelect = {
            firstClassSel: 'youzhu',
            secondSel: ''
        };
        $scope.initPage();



    }
]);