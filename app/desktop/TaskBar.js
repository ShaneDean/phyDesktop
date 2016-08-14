/**
 * Created by phy on 2016/8/8.
 */
/*!
 * Ext JS Library
 * Copyright(c) 2006-2014 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('PhyDesktop.desktop.TaskBar',{
    extend: 'Ext.toolbar.Toolbar',

    requires:[
        'Ext.button.Button',
        'Ext.resizer.Splitter',
        'Ext.menu.Menu',

        //重构的StartMenu
        'PhyDesktop.desktop.StartMenu'
    ],

    alias : 'widget.taskbar',

    cls: 'ux-taskbar',

    startBtnText: '开始',

    initComponent: function(){
        var me = this ;
        me.startMenu = new PhyDesktop.desktop.StartMenu(me.startConfig);

        me.quirckStart = new Ext.toolbar.Toolbar(me.getQuickStart());

        me.windowBar = new Ext.toolbar.Toolbar(me.getWindowBarConfig());

        me.tray = new Ext.toolbar.Toolbar(me.getTrayConfig());

        me.items = [{
            xtype:'button',
            cls:'ux-start-button',
            iconCls: 'ux-start-button-icon',
            menu:me.startMenu,
            menuAlign: 'bl-tl',
            text: me.startBtnText
        },
        me.quirckStart,
        {
            xtype: 'splitter',
            html: '&@160;',
            height: 14,
            width: 2,
            cls: 'x-toolbar-separator x-toolbar-separator-horizontal'
        },
        me.windowBar,
        '-',
/*        {
            scale: 'medium',
            icon: '/resources/img/taskbar/clock.png',
            enableToggle : true,
            pressed: true,
            toggleHandler: function(button,state){
                var clock = Ext.get("flashClock");
                if(state){
                    clock.slideIn('r',{});
                }else{
                    clock.ghost('r',{});
                }

            }
        },
        '-',*/
        me.tray
        ];

        me.callParent();

    },
    afterLayout :function(){
        var me = this;
        me.callParent();
        me.windowBar.el.on('contextmenu',me.onButtonContextMenu, me);
    },
    onButtonContextMenu : function(e){
        var me = this, t = e.getTarget(), btn= me.getWindowBtnFromEl(t);
        if(btn){
            e.stopEvent();
            me.windowMenu.theWin = btn.win;
            me.windowMenu.showBy(t);
        }

    },
    getQuickStart: function(){
        var me = this, ret ={
            minWidth: 20,
            width: 80,
            items: [],
            enableOverflow :true
        };

        Ext.each(this.quickStart, function(item){
            ret.items.push({
                tooltip : {
                    text: item.name,
                    align: 'bl-tl'
                },
                overflowText: item.name,
                iconCls : item.iconCls,
                handler : (item.handler && typeof(item.handler) === 'function') ? item.handler : me.onQuickStartClick,
                scope : me
            });
        });

        return ret;
    },
    onQuickStartClick : function(btn){
        var module = this.app.getModule(btn.module),
            window;
        if( module){
            window = module.createWindow();
            window.show();
        }
    },
    getTrayConfig : function(){
        var ret = {
            items: this.trayItems,
            width : 110
        };
        delete this.trayItems;
        return ret;
    },
    getWindowBarConfig: function(){
        return {
            flex: 1,
            cls: 'ux-desktop-windowbar',
            //&#160;  空格
            items: ['&#160;'],
            layout:{
                overflowHandler: 'Scroller'
            }
        }
    },
    getWindowBtnFromEl : function (ele) {
        var child = this.windowBar.getChildByElement ( ele );
        return child || null;
    },
    onWindowBtnClick : function(btn){
        var win = btn.win;

        if(win.minimized || hidden){
            win.show();
        }else{
            if( win.active){
                win.minimize();
            }else{
                win.toFront();
            }
        }
    },
    addTaskButton : function(win) {
        var config = {
            iconCls: win.iconCls,
            enableToggle: true,
            toggleGroup: 'all',
            width: 140,
            margins: "0 2 0 3",
            text: Ext.util.Format.ellipsis(win.title, 20),
            listeners: {
                click: this.onWindowBtnClick,
                scope: this
            },
            win: win
        };

        var cmp = this.windowBar.add(config);
        cmp.toggle(true);
        return cmp;
    },
    removeTaskButton:function(btn){
        var found,me = this;
        me.windowBar.items.each(function(item){
            if(item === btn){
                found = item
            }
            return !found
        });
        if(found){
            me.windowBar.remove(found)
        }
        return found;
    },
    setActiveButton : function(btn){
        if(btn) {
            btn.toggle(true)
        }else{
            this.windowBar.items.each(function(item){
                if(item.isButton){
                    item.toggle(false);
                }
            })
        }
    }
});