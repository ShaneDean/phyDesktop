/**
 * Created by phy on 2016/8/8.
 */
/**
 * Ext JS Library
 * Copyright(c) 2006-2014 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 * @class Ext.ux.desktop.StartMenu
 */



Ext.define('PhyDesktop.desktop.StartMenu',{
    extend: 'Ext.menu.Menu',

    //extend: 'Ext.panel.Panel',
    requires: [

        //'Ext.menu.Menu',
        //'Ext.toolbar.Toolbar'
        //'Ext.menu.Manager'
    ],
    ariaRole: 'menu',
    bodyCls: 'ux-start-menu-body',
    cls: 'x-menu ux-start-menu',
    defaultAlign: 'bl-tl',
    iconCls: 'user',
    floating: true,
    shadow: true,
    width: 300,
    initComponent: function(){
        var me = this;
            //oldMenu = me.menu;
        me.layout.align = 'stretch';
        me.items = me.menu;

        /*me.menu = new Ext.menu.Menu({
            cls: 'ux-start-menu-body',
            border : false,
            floating : false,
            items : oldMenu
        })*/
        //me.menu.layout.align = 'stretch';
        //me.items = [me.menu];
        me.callParent();


        me.toolbar = new Ext.toolbar.Toolbar(Ext.apply({
            dock:'right',
            cls: 'ux-start-menu-toolbar',
            vertical: true,
            width: 100,
            layout:{
                align: 'stretch'
            }
        }, me.toolConfig));

        //me.toolbar.layout.align = 'stretch';

        me.addDocked(me.toolbar);
        delete me.toolItems;

        me.on('deactivate',function(){
            me.hide();
        })
    },

    addMenuItem: function(){
        var menu = this.menu;
        menu.add.apply(menu,arguments);
    },

    addToolItem:function(){
        var menu = this.menu;
        menu.add.apply(menu,arguments);
    },

    showBy: function (cmp, pos, off) {
        var me = this;
        if (me.floating && cmp) {
            me.layout.autoSize = true;
            me.show();
            cmp = cmp.el || cmp;
            var xy = me.el.getAlignToXY(cmp, pos || me.defaultAlign, off);
            if (me.floatParent) {
                var point = me.floatParent.getTargetEl().getViewRegion();
                xy[0] -= point.x;
                xy[1] -= point.y
            }
            me.showAt(xy);
            me.doConstrain()
        }
        return me
    }
});