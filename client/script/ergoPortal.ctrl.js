'use strict';


angular.module('ergoPortal')
    .controller('mainController', function ($rootScope, $scope, ngDialog) {
        //the add panel modal window

        $rootScope.addPanels = function(){
            ngDialog.open({
                template: 'addPanelsPopup',
                controller: 'addPanelsCtl',
                className: 'ngdialog-theme-default'
            });
        };
    }).service('panelOrderMgr', function(){
        var mgrPanelMap     = {
                'workspace':    1,
                'drive':        2,
                'canto':        3,
                'mainCharts':   4,
                'messages':     5,
                'notifications':6},
            mgrOrder        = angular.fromJson(localStorage.getItem('panelsOrder') || ['1', '2', '3', '4', '5', '6']),
            mgrHiddens      = angular.fromJson(localStorage.getItem('panelsHidden') || {});

        return {
            getPanelIndex: function(panelInternalName){
                return mgrPanelMap[panelInternalName];
            },
            isPanelHidden: function(panelInternalName){
                return typeof mgrHiddens[panelInternalName] !== 'undefined';
            },
            getOrder: function(){
                return mgrOrder;
            },
            setOrder: function(order){
                mgrOrder = order;
                localStorage.setItem('panelsOrder', angular.toJson(mgrOrder));
            },
            hidePanel: function(panelInternalName, panelScreenName){
                mgrHiddens[panelInternalName] = panelScreenName;
                localStorage.setItem('panelsHidden', angular.toJson(mgrHiddens));
            },
            getHiddenPanels: function(){
                return mgrHiddens;
            },
            showPanel: function(panelInternalName){
                localStorage.setItem('panelsHidden', angular.toJson(mgrHiddens));
            },
            getPanelIndex: function(panelInternalName){
                return mgrPanelMap[panelInternalName];
            }
        };
    }).directive('sortablePanels', function($rootScope, panelOrderMgr){
        return {
            link: function(scope, element, attributes){
                var $container  = $(element[0]),
                    $panels     = $container.children(),
                    order       = panelOrderMgr.getOrder();

                //show the right order first
                for(var i = order.length - 1; i >= 0; i--){
                    $container.prepend($panels.get(order[i] - 1));
                }

                //add sortable
                $container.sortable({
                    handle: ".glb-wdgt-hd-drag",
                    helper: "clone",
                    revert: true,
                    tolerance: 'pointer',
                    stop: function(){
                        var order = [];
                        $container.children().each(function(e){
                            order.push($(this).attr('index'));
                        });
                        //console.log(order);
                        panelOrderMgr.setOrder(order);
                    }
                });

                //move the new shown panel to the top
                $rootScope.$on('showThisPanel', function(e, panelInternalName){
                    var order = panelOrderMgr.getOrder(),
                        panelIndex = panelOrderMgr.getPanelIndex(panelInternalName),
                        panelOrderIndex = null;

                    for(var i = 0; i < order.length; i++){
                        if(order[i] == panelIndex){
                            panelOrderIndex = i;
                            break;
                        }
                    }

                    if(panelOrderIndex){
                        $container.prepend($panels.get(panelOrderIndex));

                        $container  = $(element[0]);

                        //add sortable
                        $container.sortable({
                            handle: ".glb-wdgt-hd-drag",
                            helper: "clone",
                            revert: true,
                            tolerance: 'pointer',
                            stop: function(){
                                var order = [];
                                $container.children().each(function(e){
                                    order.push($(this).attr('index'));
                                });
                                //console.log(order);
                                panelOrderMgr.setOrder(order);
                            }
                        });

                        //reset order
                        order = [];
                        $container.children().each(function(e){
                            order.push($(this).attr('index'));
                        });
                        panelOrderMgr.setOrder(order);
                    }
                });
            }
        };
    }).controller('addPanelsCtl', function($rootScope, $scope, ngDialog, panelOrderMgr){
        $scope.panels = panelOrderMgr.getHiddenPanels();

        $scope.showPanel = function(panelInternalName){
            delete $scope.panels[panelInternalName];

            $.isEmptyObject($scope.panels) && $scope.close();

            panelOrderMgr.showPanel(panelInternalName);

            //show the panel in the panel board
            $rootScope.$emit('showThisPanel', panelInternalName);
        };

        $scope.close = function(){
            ngDialog.close();
        }
    }).directive('comPanelHeader', function(panelOrderMgr){
        function toggleGearMenu(scope){
            //(scope.panel.showGear)?(scope.panel.showGear=!scope.panel.showGear):(scope.panel.showGear=true);
            (scope.showGear)?(scope.showGear=!scope.showGear):(scope.showGear=true);
            scope.$apply();
        }
        function hideGearMenu(scope){
            scope.showGear=false;
            scope.$apply();
        }

        return{
            restrict: 'E',
            template:   '<div class="glb-wdgt-hd clearfix">' +
                '<div class="glb-wdgt-title">{{name}}</div>' +

                '<div class="glb-wdgt-hd-dropdown" ng-if="nowFilter">{{nowFilter.title}}' +
                '<div class="glb-carrot"></div>' +
                '<ul class="glb-wdgt-dropdown-list">' +
                '<li style="width:165px;" ng-repeat="filter in filters">{{filter.title}}</li>' +
                '</ul>' +
                '</div>' +

                '<div class="glb-wdgt-max">' +
                    '<div class="glb-nmh-icon glb-nmh-icon-maximize-gray"></div>' +
                '</div>' +

                '<div class="glb-wdgt-set">' +
                    '<div class="glb-nmh-icon glb-nmh-icon-settings"></div>' +
                '</div>' +
                '<ul class="glb-wdgt-set-menu" ng-show="showGear">' +
                '<li class="glb-com-button glb-wdgt-size" percentage="25">1/4</li>' +
                '<li class="glb-com-button glb-wdgt-size" percentage="32">1/3</li>' +
                '<li class="glb-com-button glb-wdgt-size" percentage="50">1/2</li>' +
                '<li class="glb-com-button glb-wdgt-size" percentage="100">1/1</li>' +
                '<li class="glb-wdgt-set-remove glb-com-button">Remove</li>' +
                '</ul>' +

                '<div class="glb-wdgt-hd-drag">' +
                '<div class="glb-nmh-icon glb-nmh-icon-draggable-white"></div>' +
                '</div>' +
                '</div>',
            replace: true,
            //scope: {
            //    panel: '='
            //},
            link: function(scope, elem, attr){
                //menu itself
                $(elem[0]).find('.glb-nmh-icon-settings').click(function(e){
                    e.stopPropagation();

                    toggleGearMenu(scope);
                });

                //max
                if(!scope.hasMaxIcon){
                    $(elem[0]).find('.glb-wdgt-max').hide();
                }else {
                    $(elem[0]).find('.glb-wdgt-max').click(function (e) {
                        e.stopPropagation();

                        scope.maxMinPanel();
                    });
                }

                //sizes
                //elem[0].querySelectorAll('.glb-wdgt-size').addEventListener('click', function(e){
                $(elem[0]).find('.glb-wdgt-size').click(function(e){
                    e.stopPropagation();

                    toggleGearMenu(scope);
                    //var widthPercentage = $(e.target).text();
                    scope.widthPercentage = $(e.target).attr('percentage') + '%';
                    scope.$apply();
                    //scope.$emit('widthChanged', widthPercentage);
                });

                //remove
                //elem[0].querySelector('.glb-wdgt-set-remove').addEventListener('click', function(e){
                $(elem[0]).find('.glb-wdgt-set-remove').click(function(e){
                    e.stopPropagation();

                    toggleGearMenu(scope);
                    //scope.$emit('removePanel');
                    scope.showMe = false;
                    panelOrderMgr.hidePanel(scope.internalName, scope.name);
                    scope.$apply();
                });

                //clicking on body to hide menu itself
                $('body').click(function(e){
                    hideGearMenu(scope);
                });
            }
        };
    });