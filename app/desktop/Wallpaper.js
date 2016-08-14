/**
 * Created by phy on 2016/8/8.
 */

/*!
 * Ext JS Library
 * Copyright(c) 2006-2014 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.Wallpaper
 * @extends Ext.Component
 * <p>This component renders an image that stretches to fill the component.</p>
 */


Ext.define('PhyDesktop.desktop.Wallpaper',{
    extend: 'Ext.Component',
    alias: 'widget.wallpaper',

    cls:'ux-wallpaper',
    html: '<image src="' + Ext.BLANK_IMAGE_URL+'">',

    stretch : false,
    wallpaper: null,
    sateful: true,
    stateId : 'desk-wallpaper',

    afterRender: function(){
        var me = this;
        me.callParent();
        me.setWallpaper(me.wallpaper,me.stretch);
    },
    applyState: function () {
        var me = this, old = me.wallpaper;
        me.callParent(arguments);
        if( old != me.wallpaper){
            me.setWallpaper(me.wallpaper);
        }
    },
    getState: function(){
        //this.wallpaper 非真返回前面，真返回后面
        return this.wallpaper && { wallpaper: this.wallpaper};
    },

    setWallpaper:function(wallpaperUrl, stretch){
        var me = this, imgEl, bkgnd;

        me.stretch = (stretch !== false);
        me.wallpaper = wallpaperUrl;


        if(me.rendered ){
            imgEl = me.el.dom.firstChild;

            if( !wallpaperUrl || wallpaperUrl == Ext.BLANK_IMAGE_URL){
                Ext.fly(imgEl).hide();
            }else if(me.stretch){
                imgEl.src = wallpaperUrl;

                me.el.removeCls('ux-wallpaper-tiled');
                Ext.fly(imgEl).setStyle({
                    width:'100%',
                    height:'100%'
                }).show();
            }else{
                Ext.fly(imgEl).hide();

                bkgnd = 'url('+wallpaperUrl+')';
                me.el.addCls('ux-wallpaper-tiled');
            }

            me.el.setStyle({
                backgroundImage: bkgnd || ''
            });
            if(me.stateful){
                me.saveState();
            }

        }
        return me;

    }


})