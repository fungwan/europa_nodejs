angular.module('myApp').controller('GlobalSettingCtrl', ['$scope', '$location', '$rootScope', 'ApiService','fileReader','$upload',
    function ($scope, $location, $rootScope, ApiService,fileReader,$upload) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'globalSetting'
        };


        $scope.originalRoles = [];//tab1大工种列表
        $scope.selectRole = {};

        $scope.originalRoles2 = [];//tab2大工种列表
        $scope.selectRole2 = {};
        $scope.originalCrafts = [];//细项列表
        $scope.selectCraft = {};

        $scope.selectRoleType = {};
        $scope.roleTypeArray = [{'name':'大工种','value':'roles'},{'name':'小工种','value':'crafts'}];
        $scope.appTypeArray = [

        ];

        var originalRole2Map = {};
        $scope.appVersionInfoArray = [];//版本列表

        $scope.recommendRoleArray = [];//推荐工种列表
        $scope.selRecommendRole = {};//选择的推荐工种

        $scope.sysConfig = {};

        $scope.appVersion = {

            //app_type:'',
            main_ver:'',
            second_ver:'',
            minor_ver:'',
            build_ver:'',
            version_name:'',
            href:''
            //status:''

        };

        $scope.checkInputVersionSyntaxStatus = false;
        $scope.checkInputFreezeTimeSyntaxStatus = false;

        //获取推广工种
        function getRecommendRole(){
            var obj = {};
            ApiService.get('/setting/recommendRole', obj, function (data) {
                if (data.result == 'success') {
                    $scope.recommendRoleArray = data.content;
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //获取保证金冻结时间
        function getFreezeTime(){
            var obj2 = {};
            ApiService.get('/setting/global', obj2, function (data) {
                if (data.result == 'success') {
                    $scope.sysConfig = data.content;
                    $scope.sysConfig.margin_freeze = data.content.margin_freeze / 3600 /24;
                    $scope.sysConfig.balance_freeze = data.content.balance_freeze / 3600 /24;
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        //获取app版本记录
        function getVersionInfo(){

            var appID = $scope.selectAppType.id;
            if(appID === undefined)return;
            var obj3 = {};
            ApiService.get('/setting/appVersions/' + appID , obj3, function (data) {
                if (data.result == 'success') {

                    var tmp = [];
                    tmp.push(data.content);
                    $scope.appVersionInfoArray = tmp;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });


        }

        //获取app agent
        function getApplications(){

            ApiService.get('/applications' , {}, function (data) {
                if (data.result == 'success') {

                    $scope.appTypeArray = data.content;
                    $scope.selectAppType = $scope.appTypeArray[0];

                    getVersionInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });


        }


        (function () {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    var regionsAndRolesArray = data.content.get_roleAndRegions;
                    var rolesArray = regionsAndRolesArray[1];
                    originalRole2Map = rolesArray[1];

                    $scope.originalRoles = rolesArray[0];
                    //$scope.selectRole = $scope.originalRoles[0];

                    $scope.originalRoles2 = rolesArray[0];
                    $scope.originalCrafts = $scope.originalRoles2[0].crafts;
                    //$scope.selectCraft = $scope.originalCrafts[0];

                    getRecommendRole();
                    getFreezeTime();
                    getApplications();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();


        $scope.AppTypeSelect = function(){
            getVersionInfo();
        };

        $scope.originalRoleSelect = function () {
            //console.log($scope.selectRole);

            //$scope.recommendRoleArray

            $scope.selRecommendRole.id = $scope.selectRole.id;
            $scope.selRecommendRole.type = 'roles';
        };


        $scope.translateRoleType = function(type){
            if(type == 'roles'){return '大工种';}else if(type === 'crafts'){return '小工种';}
        };

        $scope.translateRoleName = function(id){
            return originalRole2Map[id].name;
        };


        $scope.onEditRecommendRoleDlg = function(recommendRole){

            $scope.selRecommendRole = recommendRole;

            $scope.selectRoleType['value'] = recommendRole.type;

            $scope.selectRole = {};
            $scope.selectRole2 = {};
            $scope.selectCraft = {};

            /*if(recommendRole.type === 'roles'){

                for(x in $scope.originalRoles){
                    if($scope.originalRoles[x].id === recommendRole.id){
                        $scope.selectRole = $scope.originalRoles[x];
                        break;
                    }
                }
            }else if(recommendRole.type === 'crafts'){
                for(x in $scope.originalRoles){

                    var craftArray = $scope.originalRoles[x].crafts;
                    for(y in craftArray){
                        if(recommendRole.id === craftArray[y].id){
                            $scope.selectRole2 = $scope.originalRoles[x];
                            //$scope.selectCraft = craftArray[y];
                            break;
                        }
                    }
                }
            }*/

            $('#edit_recommendRole_dlg').modal('show');
        };

        $scope.originalRole2Select = function () {
            var roleId = $scope.selectRole2.id;
            for(var x = 0; x < $scope.originalRoles2.length;++x){
                if(roleId === $scope.originalRoles2[x].id){
                    $scope.originalCrafts = $scope.originalRoles2[x].crafts;
                    $scope.selectCraft = $scope.originalCrafts[0];
                    $scope.selRecommendRole.id = $scope.selectCraft.id;
                    $scope.selRecommendRole.type = 'crafts';
                    break;
                }
            }
        };

        $scope.originalCraftSelect = function () {
            var craftId = $scope.selectCraft.id;
            $scope.selRecommendRole.id = craftId;
            $scope.selRecommendRole.type = 'crafts';
        };


        $scope.refreshRecommendRole = function () {
            var obj = {};
            ApiService.get('/setting/recommendRole', obj, function (data) {
                if (data.result == 'success') {
                    $scope.recommendRoleArray = data.content;
                    $('#edit_recommendRole_dlg').modal('hide');
                }else{
                    alert('推广工种刷新失败！');
                }

            }, function (errMsg) {
                alert(errMsg.message);
            });

        };

        $scope.updateRecommendRole = function () {

            if(!$scope.selectRole.id && !$scope.selectRole2.id){
                alert('请选择更改项!');
                return;
            }

            var obj = {
                'recommendations':$scope.recommendRoleArray
            };
            /*ApiService.post('/setting/recommendRole', obj, function (data) {
                if (data.result == 'fail') {
                    alert('推广工种更新失败！');
                    $scope.refreshRecommendRole();
                }

                $('#edit_recommendRole_dlg').modal('hide');

            }, function (errMsg) {
                alert(errMsg.message);
            });*/

            $upload.upload({
                url: 'api/setting/recommendRole',
                data: {content:obj},
                file:$scope.selRecommendRole.imgUploadData
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {        // file is uploaded successfully
                $scope.refreshRecommendRole();
            }).error(function(){
                alert('推广工种更新失败！');
                $scope.refreshRecommendRole();
            });


        };

        $scope.updateAppVersion = function () {

            /*if($scope.selectAppType.value === '-1'){
                alert('请选择版本类型!');
                return;
            }*/

            var obj = {};
            obj.appID = $scope.selectAppType.id;
            obj.appInfo = $scope.appVersion;

            obj.appInfo.main_ver = parseInt(obj.appInfo.main_ver);
            obj.appInfo.second_ver = parseInt(obj.appInfo.second_ver);
            obj.appInfo.minor_ver = parseInt(obj.appInfo.minor_ver);

            ApiService.post('/setting/appVersion', obj, function (data) {
                if (data.result == 'fail') {
                    alert('app版本更新失败！');
                }

                getVersionInfo();
                $('#create_newVersion_dlg').modal('hide');

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };


        $scope.updateSysForFreezeTime = function(){
            var obj = {
                'margin_freeze':$scope.sysConfig.margin_freeze * 24 * 3600,
                'balance_freeze':$scope.sysConfig.balance_freeze * 24 * 3600
            };
            ApiService.post('/setting/global', obj, function (data) {
                if (data.result == 'fail') {
                    alert('系统保证金冻结时间更新失败！');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.selRecommendRole.icon_href = result;
                });
        };

        $scope.onFileSelect = function ($files) {
            if ($files.length == 0) {
                return;
            }
            $scope.selRecommendRole.imgUploadData = $files[0];
            fileReader.readAsDataUrl($files[0], $scope)
                .then(function (result) {
                    $scope.selRecommendRole.icon_href = result;
                });
        };

        $scope.onEditIntFreezeTime = function(value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputFreezeTimeSyntaxStatus = true;
            }else{
                $scope.checkInputFreezeTimeSyntaxStatus = false;
            }
        };

        $scope.onEditInt = function(value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputVersionSyntaxStatus = true;
            }else{
                $scope.checkInputVersionSyntaxStatus = false;
            }
        };

        $scope.onDelAppVersion = function (appVersion) {
            var obj = {
                params: {
                    id:appVersion.id,
                    versionName: appVersion.version_name
                }
            };

            /*var obj = {
                id:appVersion.id,
                versionName: appVersion.version_name
            };*/

            ApiService.delete('/setting/appVersion', obj, function (data) {
                if (data.result == 'fail') {
                    alert('app版本删除失败！');
                }

                getVersionInfo();

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.onShowAppVersion = function (appVersion) {
            var obj = {
                params: {
                    id:appVersion.id,
                    versionName: appVersion.version_name
                }
            };

            /*var obj = {
             id:appVersion.id,
             versionName: appVersion.version_name
             };*/

            ApiService.delete('/setting/appVersion', obj, function (data) {
                if (data.result == 'fail') {
                    alert('app版本删除失败！');
                }

                getVersionInfo();

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

    }]);