/**
 * Created by phy on 2016/8/14.
 */
Ext.define('PhyDesktop.phy.SystemStatus',{
   extend : 'PhyDesktop.desktop.Module',
    requires: [],
    id: 'systemStatus',
    refreshRate : 500,
    init : function(){
        this.launcher = {
            text: '系统状态',
            iconCls : 'icon-cpu'
        };
/*        Ext.chart.theme.Memory = Ext.extend(Ext.chart.theme.Base,{
            constructor : function(args){
                Ext.chart.theme.Memory.superclass.constructor.call(this,
                    Ext.apply({
                        colors: ["rgb(244, 16, 0)", "rgb(248, 130, 1)", "rgb(0, 7, 255)", "rgb(84, 254, 0)"]
                    }, B)
                )

            }
        });*/

    },
    createWindow : function(){
        var win = this.app.getDesktop().getWindow(this.id);
        if (!win) {
            win = this.createNewWindow()
        }
        return win
    },
    createNewWindow: function(){
        var me = this,
            desktop = me.app.getDesktop();
        me.cpuLoadData = [];
        me.cpuLoadStore = Ext.create("store.json",{
            fields: [
                "core1",
                "core2",
                "time"
            ]
        });

        me.memoryArray = ['Wired','Active','inactive','free'];
        me.memoryStore = Ext.create('store.json',{
            fields: [
                'name','memory'
            ],
            data: me.generateData(me.memoryArray)
        });
        //计数器
        me.pass = 0;

        me.processArray = ['explorer','monitor','charts','desktop','Ext3','Ext4'];
        me.processesMemoryStore = Ext.create('store.json',{
            fields: [
                'name', 'memory'
            ],
            data: me.generateData(me.processArray)
        });
        me.generateCpuLoad();
        return desktop.createWindow({
            id : 'systemstatus',
            title: '系统状态',
            width : 800,
            height: 600,
            animCollapse: false,
            constrainHeader: true,
            border: false,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            bodyStyle:{
                'background-color':'#FFF'
            },
            listeners:{
                afterrender:{
                    fn: me.updateCharts,
                    delay: 100
                },
                destroy: function(){
                    me.updateTimer = null;
                },
                scope: me
            },
            items:[{
                flex:1,
                xtype: 'container',
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                tiems:[
                    me.createCpu1LoadChart(),
                    me.createCpu2LoadChart()
                ]
            },{
                flex: 1,
                xtype: "container",
                layout: {type: "vbox", align: "stretch"},
                items: [
                    me.createMemoryPieChart(),
                    me.createProcessChart()
                ]
            }]
        })
    },
    updateCharts : function(){
        var me = this;
        clearTimeout(me.updateTimer);
        me.updateTimer = setTimeout(function () {
            var time1 = new Date().getTime();
            if (me.pass % 3 === 0) {
                me.memoryStore.loadData(me.generateData(me.memoryArray))
            }
            if (me.pass % 5 === 0) {
                me.processesMemoryStore.loadData(me.generateData(me.processArray))
            }
            me.generateCpuLoad();
            var time2 = new Date().getTime();
            //??
            me.refreshRate = Math.max(me.refreshRate, (time2 - time1) * 4);
            me.updateCharts();
            me.pass++;
            //保证循环的范围
            if(me.pass> 300){
                me.pass -= 300;
            }

        }, me.refreshRate)
    },
    createCpu1LoadChart : function(){
        return {
            flex: 1,
            xtype: "chart",
            theme: "Category1",
            animate: false,
            store: this.cpuLoadStore,
            legend: {position: "bottom"},
            axes: [{
                type: "Numeric",
                position: "left",
                minimum: 0,
                maximum: 100,
                fields: ["core1"],
                title: "CPU Load",
                grid: true,
                labelTitle: {font: "13px Arial"},
                label: {font: "11px Arial"}
            }],
            series: [{
                title: "Core 1 (3.4GHz)",
                type: "line",
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: "left",
                xField: "time",
                yField: "core1",
                style: {"stroke-width": 1}
            }]
        }
    },
    createCpu2LoadChart : function(){
        return {
            flex: 1,
            xtype: "chart",
            theme: "Category2",
            animate: false,
            store: this.cpuLoadStore,
            legend: {position: "bottom"},
            axes: [{
                type: "Numeric",
                position: "left",
                minimum: 0,
                maximum: 100,
                grid: true,
                fields: ["core2"],
                title: "CPU Load",
                labelTitle: {font: "13px Arial"},
                label: {font: "11px Arial"}
            }],
            series: [{
                title: "Core 2 (3.4GHz)",
                type: "line",
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: "left",
                xField: "time",
                yField: "core2",
                style: {"stroke-width": 1}
            }]
        }
    },
    createMemoryPieChart : function(){
        var me = this;
        return {
            flex: 1,
            xtype: "chart",
            animate: {duration: 250},
            store: this.memoryStore,
            shadow: true,
            legend: {position: "right"},
            insetPadding: 40,
            theme: "Memory:gradients",
            series: [{
                donut: 30,
                type: "pie",
                field: "memory",
                showInLegend: true,
                tips: {
                    trackMouse: true, width: 140, height: 28, renderer: function (cmp, F) {
                        var sum = 0;
                        me.memoryStore.each(function (item) {
                            sum += item.get("memory")
                        });
                        this.setTitle(cmp.get("name") + ": " + Math.round(cmp.get("memory") / sum * 100) + "%")
                    }
                },
                highlight: {segment: {margin: 20}},
                labelTitle: {font: "13px Arial"},
                label: {field: "name", display: "rotate", contrast: true, font: "12px Arial"}
            }]
        }
    },

    createProcessChart : function(){
        return Ext.create('Ext.panel.Panel', {
            bodyPadding: 5,  // Don't want content to crunch against the borders
            width: 300,
            title: 'Filters',
            items: [{
                xtype: 'datefield',
                fieldLabel: 'Start date'
            }, {
                xtype: 'datefield',
                fieldLabel: 'End date'
            }]
        });
    },


    generateData : function(array){
        var dataList = [], i, length = array.length, data;
        for (i = 0; i < array.length; i++) {
            data = Math.floor(Math.random() * length * 100) / 100 + 2;
            length = length - (data - 5);
            dataList.push({name: array[i], memory: data})
        }
        return dataList
    },
    generateCpuLoad: function(){
        var me = this, cpuOldLoadData = me.cpuLoadData;

        function transfer(target) {
            var ret = target + ((Math.floor(Math.random() * 2) % 2) ? -1 : 1) * Math.floor(Math.random() * 9);
            if (ret < 0 || ret > 100) {
                ret = 50
            }
            return ret
        }

        if (cpuOldLoadData.length === 0) {
            cpuOldLoadData.push({core1: 0, core2: 0, time: 0});
            for (var i = 1; i < 100; i++) {
                cpuOldLoadData.push({core1: transfer(cpuOldLoadData[i - 1].core1), core2: transfer(cpuOldLoadData[i - 1].core2), time: i})
            }
            me.cpuLoadStore.loadData(cpuOldLoadData)
        } else {
            //去掉第一个数据
            me.cpuLoadStore.data.removeAt(0);
            //剩下的所有数据time前移为数据的index
            me.cpuLoadStore.data.each(function (item, index) {
                item.data.time = index
            });
            //在生产最后一个新的数据
            var lastData = me.cpuLoadStore.last().data;
            me.cpuLoadStore.loadData([{core1: transfer(lastData.core1), core2: transfer(lastData.core2), time: lastData.time + 1}], true)
        }
    }

});