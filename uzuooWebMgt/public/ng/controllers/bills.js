'use strict';

angular.module('myApp').controller('BillsCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'billAdmin',
            secondSel:'bills'
        };

        $scope.billsArray = [];
        $scope.billInfo = {};//选中查看的财务明细信息
        $scope.cityArray = [];                               //城市列表
        $scope.regionArray = [];                             //所有区域列表
        $scope.originalRoles = [];                          //大工种列表
        var filters  = ['all'];
        $scope.searchFilter = {
            phone:'',
            payType:'all'
        };
        var totalBillsPages = 1,curBillPage=1;

        //支付项
        var billTypeCNTranslateObj = {
            'construction':'工程款支付',
            'settle':'工程款结算',
            'withhold_margin':'抽取保证金',
            'withdraw_margin':'保证金提现',
            'recharge_margin':'保证金充值',
            'recharge_margin_offline':'保证金线下充值',
            'recharge_offline':'余额线下充值',
            'recharge':'余额充值',
            'withdraw':'余额提现',
            'refund':'退款',
            'earnest':'定金支付',
            'trustee':'托管尾款支付',
            'giving_ubeans':'系统赠送现金券',
            'giving_margin':'系统赠送保证金',
            'cash_back':'返现',
            'withhold_commission_b':'抽取基础佣金',
            'withhold_commission_f':'抽取绩效佣金',
            '':''
        };

        //系统账户
        var tradeTypeCNTranslateObj = {
            'UzuooBasicCommission':'基础佣金账户',
            'UzuooFloatCommission':'绩效佣金账户',
            'UzuooTrusteedEarnest':'托管定金账户',
            'UzuooTrusteedFinalPayment':'托管尾款账户',
            'capital':'个人余额账户',
            'margin':'个人保证金账户',
            'ubean':'业主现金券账户',
            'recharge_offline':'余额线下充值',
            'commision_basic':'基础佣金账户',
            'commision_float':'绩效佣金账户',
            'third_part':'第三方账户',
            'earnest':'托管定金账户',
            'trustee':'托管尾款账户',
            'pre_withdraw':'待提现账户',
            'bank':'银行卡账户',
            '':''
        };

        //支付来源
        var backendObj = {
            'wxpay':'微信支付',
            'alipay':'支付宝',
            'uzuoopay':'悠住支付',//包含余额、现金券等,
            '':''
        };


        $scope.onExactSearch = function () {

            filters = [];
            if ($scope.searchFilter.phone !== '') {
                var keywordFilterStr = 'phone::' + $scope.searchFilter.phone;
                filters.push(keywordFilterStr);
                getBillsInfo(1,filters);
            }
        };

        $scope.onSearch = function () {

            filters = [];
            if ($scope.searchFilter.payType !== ''&& $scope.searchFilter.payType !== 'all') {
                var keywordFilterStr = 'type::' + $scope.searchFilter.payType;
                filters.push(keywordFilterStr);
                getBillsInfo(1,filters);
            }else{
                getBillsInfo(1,['all']);
            }
        };

        //获取工人的城市和区域信息
        $scope.getCityAndRegionStr = function (regionArray) {
            var regionsStr = '';
            var cityStr = '';
            for (var x in regionArray) {
                regionsStr += $scope.regionArray[regionArray[x]].name + ' ';
                cityStr = $scope.regionArray[regionArray[x]].parent;
            }
            return {
                regions: regionsStr,
                city: cityStr
            }
        };

        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                    $scope.regionArray = $scope.regionsAndRolesArray[0][1];
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];

                    getBillsInfo(1,['all']);

                }
            }, function (errMsg) {
                alert(errMsg);
            });
        }

        getRoleAndRegionsInfo();

        function getBillsInfo(cur,filterArray){

            var obj = {
                params: {
                    page: cur,
                    filters:filterArray
                }
            };

            ApiService.get('/bills', obj, function (data) {
                if (data.result == 'success') {
                    $scope.billsArray = data.content;
                    totalBillsPages = data.pages;
                    billsPaging(cur);
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        $scope.getCashStr = function(type,payInfo){

            var result = '';
            if(type === 'source'){

                result += payInfo.account_name/*who*/ + ','
                    +tradeTypeCNTranslateObj[payInfo.account_type] /*where*/+','+backendObj[payInfo.backend] /*which*/;



            }else if(type === 'target'){

                result += payInfo.account_name/*who*/ +','+ tradeTypeCNTranslateObj[payInfo.account_type] /*where*/;
            }

            return result;
            /*if(tradeTypeCNTranslateObj[payInfo.capital_account_id] !== undefined){
                return tradeTypeCNTranslateObj[payInfo.capital_account_id];
            }else if(tradeTypeCNTranslateObj[payInfo.capital_account_id] === undefined && payInfo.phone !== ''){
                return payInfo.phone;
            }else if(tradeTypeCNTranslateObj[payInfo.capital_account_id] === undefined && payInfo.capital_account_id !== ''){
                return payInfo.account_name;//eg:ACSFAS321aliPay/weixinPay
            }else{
                return payInfo.account_name;
            }*/
        };

        $scope.translateBillType = function(type){
            if(billTypeCNTranslateObj[type] === undefined){
                return type;
            }else{
                return billTypeCNTranslateObj[type];
            }
        };

        $scope.checkBill = function (billInfo) {


            var tradeId = billInfo.tradeId;
            var _status = billInfo.status + 1;

            var obj = {
                status: _status
            };

            if(billInfo.status === 0){
                ApiService.post('/bills/checkBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行初审动作...');
                            return;
                        }
                        alert('初审核通过失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(billInfo.status === 1){
                ApiService.put('/bills/checkBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行复审动作...');
                            return;
                        }
                        alert('复审核通过失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

        };

        $scope.rejectBill = function (billInfo) {

            var tradeId = billInfo.tradeId;
            var _status = 0;

            if(billInfo.status === 0){
                _status = 3;
            }else if(billInfo.status === 1){
                _status = 4;}

            var obj = {
                status: _status
            };

            if(_status === 3){
                ApiService.post('/bills/rejectBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{

                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行拒绝初审动作...');
                            return;
                        }
                        alert('拒绝初审失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(_status === 4){
                ApiService.put('/bills/rejectBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行拒绝复审动作...');
                            return;
                        }
                        alert('拒绝复审失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

        };

        function billsPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#billsPage'),
                pages: totalBillsPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    curBillPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getBillsInfo(obj.curr,filters);
                        firstScreeningPagination = false;
                    }
                }
            });
        }

        $scope.getBillsDetailInfo = function(billInfo){

            var detailLink = billInfo['href'];
            var pos = detailLink.lastIndexOf('/');
            var tradeId = detailLink.substr(pos+1);


            ApiService.get('/bills/'+ tradeId, {}, function (data) {
                if (data.result == 'success') {

                    $scope.billInfo = data.content;
                    $scope.billInfo.tradeId = tradeId;
                    $("#show_billDetail_dlg").modal('show');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

    }]);