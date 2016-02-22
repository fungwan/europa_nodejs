'use strict';

angular.module('myApp').controller('OrdersCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'billAdmin',
            secondSel: 'orders'
        };

        $scope.moreLinkStr = '更多搜索条件';
        $scope.moreLink = true;

        $scope.searchFilter = {
            orderId: '',
            startDate: '',
            endDate: '',
            workerName: '',
            stutus: ''
        }

        $scope.onClickMore = function () {
            $scope.moreLink = !$scope.moreLink;
            if ($scope.moreLink) {
                $scope.moreLinkStr = '更多搜索条件';
            } else {
                $scope.moreLinkStr = '精简筛选条件';
            }
        }

        $scope.onSearch = function () {
            return;
        }


        $scope.curOrdersPage = 1;

        $scope.getRegionStr = function (region_id) {
            return $scope.regionsArray[1][region_id].name;
        }

        $scope.getOrderId = function (order) {
            var orderDetailHref = order.order_href;
            var pos = orderDetailHref.lastIndexOf('/');
            return orderDetailHref.substr(pos + 1);
        }

        $scope.getCraftsInfo = function (order) {
            var craftsArray = order.crafts;
            var craftsInfo = '';
            for (var c in craftsArray) {
                craftsInfo += $scope.rolesArray[1][craftsArray[c]].name;
                craftsInfo += ' ';
            }
            return craftsInfo;
        }

        var statusArrary = ["待付定金", "待签约", "待付款", "施工中", "待评价", "待施工", "已完工", "失效订单"];

        $scope.getStatus = function (status) {
            return (status == 100) ? statusArrary[statusArrary.length - 1] : statusArrary[status];
        }

        $scope.onShowOrderDetail = function (order) {
            if (order.status == 0 || order.status == 1) {
                $scope.statusTitleStyle = 0;
            } else if (order.status == 2 || order.status == 5) {
                $scope.statusTitleStyle = 1;
            } else if (order.status == 3 || order.status == 4) {
                $scope.statusTitleStyle = 2;
            } else {
                $scope.statusTitleStyle = 3;
            }


            $scope.orderDetailInfo = {};
            var obj = {};
            var orderDetailHref = order.order_href;
            var pos = orderDetailHref.lastIndexOf('/');
            var orderId = orderDetailHref.substr(pos + 1);
            var url = "/orders/" + orderId;
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo = data.content;
                    var gender = ($scope.orderDetailInfo.gender == 0) ? '女士' : '先生';
                    $scope.orderDetailInfo.houseOwnerName = $scope.orderDetailInfo.first_name + gender;

                    var candidatesArray = $scope.orderDetailInfo.worker_candidates;
                    var candidateTxt = '';
                    var candidatesMap = {};
                    for (var z in candidatesArray) {
                        candidateTxt += candidatesArray[z].name;
                        candidatesMap[candidatesArray[z].account_id] = candidatesArray[z];
                        if (z !== (candidatesArray.length - 1).toString()) {
                            candidateTxt += ',';
                        }
                    }
                    $scope.orderDetailInfo.candidateTxt = candidateTxt;
                    
                    //遍历订单中的所有合同，查看各个状态,找出已中标的合同
                    var contractArray = data.content.contracts;
                    $scope.orderDetailInfo.bidContractInfo = {};
                    for (var i in contractArray) {
                        var contractItem = contractArray[i];
                        if (contractItem.status == 1) {//表示已经签约
                            $scope.orderDetailInfo.bidContractInfo = contractItem;
                            break;
                        }
                    }
                    if ($scope.orderDetailInfo.bidContractInfo) {
                        getContracts();
                        getContractsProcess();
                    }


                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsArray = data.content.get_roleAndRegions[0];
                    $scope.rolesArray = data.content.get_roleAndRegions[1];
                    getOrdersBypage(1);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function getOrdersBypage(pageIndex) {
            var filters = ["all"];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            };

            ApiService.get('/orders', obj, function (data) {
                if (data.result == 'success') {
                    $scope.ordersInfo = data.content;
                    $scope.totalOrdersPages = data.pages;

                    //分页控件
                    ordersPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //jequry paging controll
        function ordersPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#ordersPage'),
                pages: $scope.totalOrdersPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curOrdersPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getOrdersBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
        //获取签约的合同信息
        function getContracts() {
            var obj = {};
            var url = '/contracts/' + $scope.orderDetailInfo.bidContractInfo.id;
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo.contractDetail = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //获取施工进程
        function getContractsProcess() {
            var obj = {};
            var url = '/contracts/' + $scope.orderDetailInfo.bidContractInfo.id + '/items';
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo.contractItemArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();


    }
]);