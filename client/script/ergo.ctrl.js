'use strict';


angular.module('ergo')
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
    }).controller('clientWorkspace', function($rootScope, $scope, panelOrderMgr){
        var maxWidthPt  = 100,
            maxHeightPx = 700,
            normalWidthPt   = 32,
            normalHeightPx  = 520;

        $scope.internalName     = 'workspace';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Client Workspaces';
        $scope.widthPercentage  = '32%';
        $scope.heightPixel      = '520px';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);
        $scope.hasMaxIcon       = true;
        $scope.normalSize       = true;

        $scope.maxMinPanel = function(){
            if(parseInt($scope.heightPixel) === maxHeightPx){   //to be normal
                $scope.widthPercentage  = normalWidthPt + '%';
                $scope.heightPixel      = normalHeightPx + 'px';
                $scope.normalSize       = true;
            }else{  //to be max
                //save the width first
                normalWidthPt = parseInt($scope.widthPercentage);

                $scope.widthPercentage  = maxWidthPt + '%';
                $scope.heightPixel      = maxHeightPx + 'px';
                $scope.normalSize       = false;
            }
            $scope.$apply();
        };

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });
    }).controller('googleDrive', function($rootScope, $scope, panelOrderMgr){
        $scope.internalName     = 'drive';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Files and Documents';
        $scope.widthPercentage  = '32%';
        $scope.heightPixel      = '520px';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);
        $scope.hasMaxIcon       = true;

        $scope.maxMinPanel = function(){
            var win = window.open('https://drive.google.com/drive/my-drive', '_blank');
            win.focus();
        };

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });
    }).controller('canto', function($rootScope, $scope, panelOrderMgr){
        $scope.internalName     = 'canto';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Digital Asset Management';
        $scope.widthPercentage  = '32%';
        $scope.heightPixel      = '520px';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);
        $scope.hasMaxIcon       = true;

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });
    }).controller('mainChartPanel', function($rootScope, $scope, panelOrderMgr){
        $scope.internalName     = 'mainCharts';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Main Charts';
        $scope.widthPercentage  = '100%';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });

        //first chart
        $scope.chartOne = {};
        $scope.chartOne.type = "PieChart";
        $scope.onions = [
            {v: "Onions"},
            {v: 3},
        ];
        $scope.chartOne.data = {"cols": [
            {id: "t", label: "Topping", type: "string"},
            {id: "s", label: "Slices", type: "number"}
        ], "rows": [
            {c: [
                {v: "New"},
                {v: 3},
            ]},
            {c: $scope.onions},
            {c: [
                {v: "In Estimation"},
                {v: 31}
            ]},
            {c: [
                {v: "Quoted"},
                {v: 1}
            ]},
            {c: [
                {v: "Ordered"},
                {v: 2}
            ]},
            {c: [
                {v: "Completed"},
                {v: 5}
            ]}
        ]};
        $scope.chartOne.options = {
            'title': 'Open Projects'
        };

        //second chart
        $scope.chartTwo = {};
        $scope.chartTwo.type = "PieChart";
        $scope.onions = [
            {v: "Onions"},
            {v: 3},
        ];
        $scope.chartTwo.data = {"cols": [
            {id: "t", label: "Topping", type: "string"},
            {id: "s", label: "Slices", type: "number"}
        ], "rows": [
            {c: [
                {v: "New"},
                {v: 3},
            ]},
            {c: $scope.onions},
            {c: [
                {v: "In Estimation"},
                {v: 31}
            ]},
            {c: [
                {v: "Quoted"},
                {v: 1}
            ]},
            {c: [
                {v: "Ordered"},
                {v: 2}
            ]},
            {c: [
                {v: "Completed"},
                {v: 5}
            ]}
        ]};
        $scope.chartTwo.options = {
            'title': 'Open Projects'
        };

        //third chart
        $scope.chartThree = {};
        $scope.chartThree.type = "PieChart";
        $scope.onions = [
            {v: "Onions"},
            {v: 3},
        ];
        $scope.chartThree.data = {"cols": [
            {id: "t", label: "Topping", type: "string"},
            {id: "s", label: "Slices", type: "number"}
        ], "rows": [
            {c: [
                {v: "New"},
                {v: 3},
            ]},
            {c: $scope.onions},
            {c: [
                {v: "In Estimation"},
                {v: 31}
            ]},
            {c: [
                {v: "Quoted"},
                {v: 1}
            ]},
            {c: [
                {v: "Ordered"},
                {v: 2}
            ]},
            {c: [
                {v: "Completed"},
                {v: 5}
            ]}
        ]};
        $scope.chartThree.options = {
            'title': 'Open Projects'
        };
    }).controller('messagesPanel', function($rootScope, $scope, panelOrderMgr){
        $scope.internalName     = 'messages';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Messages';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };
        $scope.messages = [
            {id: 1, subject:'hello from Henry', content:'How are you!'},
            {id: 1, subject:'About July Release', content:'Is it on schedule? Please call me if anything'},
            {id: 1, subject:'Please join the scrum meeting tomorrow', content:'Just a friendly reminder'}
        ];

        $scope.replay = function(messageId, indexId){
            $scope.messages[indexId].showReply = true;
            //alert('replying ' + messageId);
        };
        $scope.sendMessage = function(messageId, indexId){
            $scope.messages[indexId].showReply = false;
        };

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });
    }).controller('notificationsPanel', function($rootScope, $scope, panelOrderMgr){
        $scope.internalName     = 'notifications';
        $scope.panelIndexId     = panelOrderMgr.getPanelIndex($scope.internalName);
        $scope.name             = 'Daily Notifications';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = !panelOrderMgr.isPanelHidden($scope.internalName);

        //global event sent from addPanelsCtl to tell panel to show itself
        $rootScope.$on('showThisPanel', function(e, panelInternalName){
            if($scope.internalName === panelInternalName){
                $scope.showMe = true;
            }
        });
    }).controller('projectToEstimatePanel', function($scope){
        $scope.name             = 'Project to Estimate';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'Due Today',
                value: 'dueToday'},
            {   title: 'Due This Week',
                value: 'dueThisWeek'},
            {   title: 'Due Within 7 Days',
                value: 'due7Days'},
            {   title: 'Overdue 7 Days',
                value: 'overdue7Days'},
            {   title: 'All Overdue',
                value: 'allOverdue'},
            {   title: 'All',
                value: 'all'},
            {   title: 'Received Today',
                value: 'receivedToday'},
            {   title: 'Received Past 2 Days',
                value: 'received2Days'},
            {   title: 'Received Past 7 Days',
                value: 'received7Days'}
        ];
        $scope.nowFilter = {
            title: 'Received Past 2 Days',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('tasksPanel', function($scope){
        $scope.name             = 'Tasks';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'Due Today',
                value: 'dueToday'},
            {   title: 'Due This Week',
                value: 'dueThisWeek'},
            {   title: 'Due Within 7 Days',
                value: 'due7Days'},
            {   title: 'Overdue 7 Days',
                value: 'overdue7Days'},
            {   title: 'All Overdue',
                value: 'allOverdue'},
            {   title: 'All',
                value: 'all'},
            {   title: 'Received Today',
                value: 'receivedToday'},
            {   title: 'Received Past 2 Days',
                value: 'received2Days'},
            {   title: 'Received Past 7 Days',
                value: 'received7Days'}
        ];
        $scope.nowFilter = {
            title: 'Received Past 2 Days',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('estimateToReviewPanel', function($scope){
        $scope.name             = 'Estimates to Review';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'Due Today',
                value: 'dueToday'},
            {   title: 'Due This Week',
                value: 'dueThisWeek'},
            {   title: 'Due Within 7 Days',
                value: 'due7Days'},
            {   title: 'Overdue 7 Days',
                value: 'overdue7Days'},
            {   title: 'All Overdue',
                value: 'allOverdue'},
            {   title: 'All',
                value: 'all'},
            {   title: 'Received Today',
                value: 'receivedToday'},
            {   title: 'Received Past 2 Days',
                value: 'received2Days'},
            {   title: 'Received Past 7 Days',
                value: 'received7Days'}
        ];
        $scope.nowFilter = {
            title: 'Received Past 2 Days',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('pendingInvoicesPanel', function($scope){
        $scope.name             = 'Pending Invoices';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('pendingOrdersPanel', function($scope){
        $scope.name             = 'Pending Orders and Changes';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('pendingQuotesPanel', function($scope){
        $scope.name             = 'Pending Quotes';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('openRfqsPanel', function($scope){
        $scope.name             = 'Open RFQs';
        $scope.widthPercentage  = '50%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
    }).controller('projectsPanel', function($scope){
        $scope.name             = 'Hot Projects';
        $scope.widthPercentage  = '100%';
        $scope.showMe           = true;
        $scope.filters = [
            {   title: 'All Unread',
                value: 'dueToday'},
            {   title: '6 Most Recent',
                value: 'dueThisWeek'},
            {   title: '12 Most Recent',
                value: 'due7Days'},
            {   title: '20 Most Recent',
                value: 'overdue7Days'},
            {   title: 'Received Today',
                value: 'allOverdue'},
            {   title: 'Received This Week',
                value: 'all'}
        ];
        $scope.nowFilter = {
            title: '20 Most Recent',
            value: 'received2Days'
        };

        //listen on event 'widthChanged' and 'removePanel' events
        $scope.$on('widthChanged', function(event, width){
            $scope.widthPercentage = width;
            $scope.$apply();
        });
        $scope.$on('removePanel', function(){
            $scope.showMe = false;
            $scope.$apply();
        });
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