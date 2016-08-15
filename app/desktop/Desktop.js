/**
 * Created by phy on 2016/8/8.
 */

Ext.define("PhyDesktop.desktop.Desktop",{
    extend: 'Ext.panel.Panel',

    alias: 'widget.desktop',

    uses: [
        'Ext.util.MixedCollection',
        'Ext.menu.Menu',
        'Ext.view.View', // dataview
        'Ext.window.Window',

        //自己增加的类
        'PhyDesktop.desktop.TaskBar',
        'PhyDesktop.desktop.Wallpaper',
        'PhyDesktop.desktop.Notification'
    ],

    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    lastActiveWindow: null,

    border: false,
    html: '&#160;',
    layout: 'fit',

    xTickSize: 1,
    yTickSize: 1,

    app: null,

    shortcuts: null,

    shortcutItemSelector: 'div.ux-desktop-shortcut',

    shortcutTpl: [
        '<tpl for=".">',
        '<div class="ux-desktop-shortcut" id="{name}-shortcut">',
        '<div class="ux-desktop-shortcut-icon {iconCls}">',
        '<img src="',Ext.BLANK_IMAGE_URL,'" title="{name}">',
        '</div>',
        '<span class="ux-desktop-shortcut-text">{name}</span>',
        '</div>',
        '</tpl>',
        '<div class="x-clear"></div>'
    ],

    taskbarConfig: null,

    windowMenu: null,

    initComponent: function () {

        var me = this;
        //开始栏窗体右击菜单按钮
        me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());

        me.bbar = me.taskbar = new PhyDesktop.desktop.TaskBar(me.taskbarConfig);
        me.taskbar.windowMenu = me.windowMenu;
        me.windows = new Ext.util.MixedCollection();

        //桌面右击菜单
        me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());
        me.items = [
            {
                xtype:'wallpaper',
                id: me.id + '_wallpaper'
            },
            me.createDataView()
        ];

        me.callParent();

        me.shortcutsView = me.items.getAt(1);

        me.shortcutsView.on("itemclick", me.onShortcutItemClick, me);
        me.shortcutsView.on("render", me.onRenderShortcut, me);


        var wallpaperUrl = me.wallpaper;
        me.wallpaper = me.items.getAt(0);
        if ( wallpaperUrl){
            me.setWallpaper(wallpaperUrl , me.wallpaperStretch)
        }
    },
    afterRender: function(){
        var me = this;
        me.callParent();
        me.el.on("contextmenu", me.onDesktopMenu,me);

    },
    onDesktopMenu : function(e){
        var me = this, menu = me.contextMenu;
        e.stopEvent();
        if (!menu.rendered) {
            menu.on("beforeshow", me.onDesktopMenuBeforeShow, me)
        }
        menu.showAt(e.getXY());
        menu.doConstrain()
    },
    onDesktopMenuBeforeShow : function(menu){
        var me = this, count = me.windows.getCount();
        menu.items.each(function (item) {
            var min = item.minWindows || 0;
            item.setDisabled(count < min)
        })
    },
    createWindowMenu :function(){
        var me =this;
        return {
            defaultAlign: 'br-tr',
            items: [{
                text:'还原',
                handler: me.onWindowMenuRestore,
                scope : me
            },{
                text:'最小化',
                handler : me.onWindowMenuMinimize,
                scope : me
            },{
                text: '最大化',
                handler : me.onWindowMenuMaximize,
                scope: me
            },
            '-',
            {
                text:'关闭',
                handler: me.onWindowMenuClose,
                scope: me
            }],
            listeners : {
                beforeshow : me.onWindowMenuBeforeShow,
                hide : me.onWindowMenuHide,
                scope: me
            }
        }
    },
    onWindowMenuRestore : function(){
        var me = this, win = me.windowMenu.theWin;
        me.restoreWindow(win);
    },
    onWindowMenuMinimize : function(){
        var me = this, win = me.windowMenu.theWin;
        win.minimize();
    },
    onWindowMenuMaximize : function(){
        var me = this, win = me.windowMenu.theWin;
        win.maximize();
        win.toFront();
    },
    onWindowMenuClose : function(){
        var me = this, win = me.windowMenu.theWin;
        win.close();
    },
    onWindowMenuBeforeShow : function(menu){
        var items = menu.items.items, win = menu.theWin;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[1].setDisabled(win.minimized === true); // Minimize
        items[2].setDisabled(win.maximized === true || win.hidden === true); // Maximize
    },
    onWindowMenuHide : function(menu){
        Ext.defer(function(){
            menu.theWin = null;
        }, 1);
    },
    restoreWindow: function(win){
        if( win.isVisible()){
            win.restore();
            win.toFront();
        } else {
            win.show();
        }
        return win;
    },
    createDesktopMenu : function(){
        var me = this;
        var ret = {
            items : me.contextMenuItems || []
        };
        ret.items.push(
            '-',
            {
                text:'关闭所有窗口',
                handler: me.closeAllWindows,
                iconCls : 'icon-closeall',
                scope : me,
                minWindows:1
            },
            '-',
            {
                text:'显示桌面',
                iconCls:'mymac',
                handler: me.showDesktop,
                scope: me
            });
        return ret;


    },
    closeAllWindows: function(){
        var me = this, windowCount = me.windows.getCount();
        if (windowCount < 1) {
            return
        }
        Ext.MessageBox.confirm("操作确认", "确定要关闭当前所有窗口吗?", function (buttonId) {
            if (buttonId == "yes") {
                var that = this;
                that.windows.each(function (win) {
                    win.close()
                })
            }
        }, this)
    },
    showDesktop : function(){
        var me = this;
        me.windows.each(function(win){
            if(!win.minimized){
                win.minimize()
            }
        })

    },
    initShortcut :function(){
        var shortcutHeight = 80;
        var shortcutWidth = 80;
        var margin = 8;
        this.col = null;
        this.row = null;
        var currentHeight;
        var bodyHeight = Ext.getBody().getHeight();

        function init() {
            col = {index: 1, x: margin};
            row = {index: 1, y: margin + 27}
        }

        this.setXY = function (target) {
            currentHeight = row.y + shortcutHeight;
            //如果当前的shortcut超出了一列的范围则 跳转到下一列
            if (currentHeight > bodyHeight && currentHeight > (shortcutHeight + margin)) {
                col = {index: col.index++, x: col.x + shortcutWidth + margin};
                //默认列之间的间隔范围是 margin + 27px
                row = {index: 1, y: margin + 27}
            }
            Ext.fly(target).setXY([col.x, row.y]);
            row.y = row.y + shortcutHeight + margin + 4
        };
        this.handleUpdate = function () {
            init();
            var cmp = Ext.query(".ux-desktop-shortcut");
            for (var i = 0, length = cmp.length; i < length; i++) {
                this.setXY(cmp[i])
            }
        };
        this.handleUpdate();
        Ext.Function.defer(this.handleUpdate, 500, this, []);

        //方法过时
        //Ext.EventManager.onWindowResize(this.handleUpdate, this, {delay: 500});

        Ext.getWin().on('windowResize',this.handleUpdate, this, {delay: 500});

    },
    createDataView : function(){
        var me = this;
        return {
            xtype : 'dataview',
            overItemCls : 'x-view-over',
            trackOver : true ,
            itemSelector : me.shortcutItemSelector,
            store: me.shortcuts,
            style:{
                position : 'absolute'
            },
            x : 0,
            y : 0,
            tpl : new Ext.XTemplate(me.shortcutTpl),
            listeners: {
                resize: function(){
                    me.initShortcut();
                }
            }
        }

    },
    onShortcutItemClick : function(dataView , record){
        var me = this, module, win;

        if( record.data.module == ''){
            win = me.createMyWindow(record.data);
        }else{
            module = me.app.getModule(record.data.module);
                win = module && module.createWindow();
        }

        if( win){
            me.restoreWindow(win);
        }
    },
    createMyWindow : function(data){
        var recordData = data ;
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(recordData.id);
        if(!win){
            win = desktop.createWindow({
                border: false,
                id: recordData.id,
                title: recordData.title,
                width: (typeof recordData.width === 'string' ?parseInt(recordData.width) : recordData.width),
                height: (typeof recordData.width === 'string' ?parseInt(recordData.height) : recordData.height),
                maximizable: recordData.maximizable,
                resizable: recordData.resizable,
                iconCls: "icon-ie",
                hideMode: "offsets",
                constrain: true,
                listeners: {
                    resize: function (target, width, height) {
                        if (recordData.isResize && !Ext.isEmpty(Ext.getCmp("panel" + target.id))) {
                            Ext.getCmp("panel" + target.id).setHeight(height - 30);
                            Ext.getCmp("panel" + target.id).setWidth(width - 3);
                        }
                    }
                },
                layout: "fit",
                loader: {
                    url: recordData.appUrl,
                    autoLoad: true,
                    scripts: true
                }
            })
        }
        win.show();
        return win;
    },
    onRenderShortcut :function(shortcut){
        var me = this;
        me.shortcutsView.dragZone = new Ext.dd.DragZone(shortcut.getEl(), {
            getDragData: function (e) {
                var target = e.getTarget(shortcut.itemSelector, 10);
                if (target) {
                    d = target.cloneNode(true);
                    d.id = Ext.id();
                    return {ddel: d, sourceEl: target, sourceStore: shortcut.store, draggedRecord: shortcut.getRecord(target)}
                }
            }, getRepairXY: function () {
                return this.dragData.repairXY
            }, onMouseUp: function (e) {
                var cmp = Ext.fly(this.dragData.sourceEl);
                var old_position = cmp.getXY();
                var new_position = e.getXY();
                var width = cmp.getWidth();
                var height = cmp.getHeight();
                if (Math.abs(old_position[0] - new_position[0]) > width || Math.abs(old_position[1] - new_position[1]) > height) {
                    cmp.setXY(new_position);
                    Ext.get(this.dragData.sourceEl).frame("#ff0000", 1)
                }
            }
        })
    },
    createWindow : function(config, cls){
        var me = this, win,
            cfg = Ext.applyIf(config || {} ,{
                stateful : false,
                isWindow : true,
                constrainHeader : true,
                minimizable : true,
                maximizable : true
            });

        cls = cls || Ext.window.Window;
        win = me.add(new cls(cfg));

        var notification = Ext.create('widget.uxNotification',{
            title:'信息提示',
            corner: 'br',
            stickOnClick : false,
            manager: 'desktop',
            iconCls: 'ux-notification-icon-information',
            html: "正在载入窗口：<span style='color:blue;'>" + win.title +"</span>， <br>请稍后.."
        });
        notification.show();
        me.windows.add(win);
        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;

        win.on({
            activate: me.updateActiveWindow,
            beforeshow: me.updateActiveWindow,
            deactivate: me.updateActiveWindow,
            minimize: me.minimizeWindow,
            destroy: me.onWindowClose,
            scope: me
        });

        win.on({
            boxready: function () {
                win.dd.xTickSize = me.xTickSize;
                win.dd.yTickSize = me.yTickSize;
                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize
                }
            }, single: true
        });
        //自定义事件 move
        win.on('move',function (C, x, y, D) {
            if ((y + win.getHeight) > (me.getHeight() - me.taskbar.getHeight())) {
                win.setPosition(x, me.getHeight() - win.getHeight() - me.taskbar.getHeight() - 5)
            }
        });


        // replace normal window close w/fadeOut animation:
        win.doClose = function () {
            win.doClose = Ext.emptyFn;
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
                        win.destroy()
                    }
                }
            })
        };

        return win;
    },
    updateActiveWindow :function() {
        var me = this,
            activeWindow = me.getActiveWindow(),
            last = me.lastActiveWindow;

        if (last && last.destroyed) {
            me.lastActiveWindow = null;
            return;
        }
        if (activeWindow === last) {
            return;
        }

        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }
            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }

        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
    },
    onWindowClose : function( win){
        var me = this;
        me.windows.remove(win);
        me.taskbar.removeTaskButton(win.taskButton);
        me.updateActiveWindow();

    },
    minimizeWindow: function (win) {
        win.minimized = true;
        win.hide()
    },
    getActiveWindow : function(){
        var win = null, dzim = this.getDesktopZIndexManager();
        if (dzim) {
            dzim.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false
                }
                return true
            })
        }
        return win
    },
    getWindow :function(id){
        return this.windows.get(id);
    },
    getDesktopZIndexManager: function(){
        var windows = this.windows;
        // TODO - there has to be a better way to get this...
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;

    },
    setWallpaper : function(wallpaper , stretch ){
        this.wallpaper.setWallpaper(wallpaper, stretch);
        return this;
    }


});