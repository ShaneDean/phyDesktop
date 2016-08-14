/**
 * Created by phy on 2016/8/10.
 */


Ext.define('PhyDesktop.desktop.App',{
    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.container.Viewport',

        'PhyDesktop.desktop.Desktop'
    ],

    isReady: false,
    modules: null,
    useQuickTips: true,

    constructor: function (config) {
        var me = this;

        me.mixins.observable.constructor.call(this, config);

        if (Ext.isReady) {
            Ext.Function.defer(me.init, 10, me);
        } else {
            Ext.onReady(me.init, me);
        }
    },
    init : function(){
        var me = this, desktopConfig;
        if (me.useQuickTips) {
            Ext.QuickTips.init()
        }
        me.modules = me.getModules();
        if (me.modules) {
            me.initModules(me.modules);
        }

        desktopConfig = me.getDesktopConfig();
        me.desktop = new PhyDesktop.desktop.Desktop(desktopConfig);
        me.viewport = new Ext.container.Viewport({
                                            layout:'fit',
                                            items:[me.desktop]
                                        });

        Ext.getWin().on('beforeunload',me.onUnload, me);
        me.isReady = true;
        me.fireEvent('ready', me);

    },
    onReady : function(fn, scope) {
        if (this.isReady) {
            fn.call(scope, this);
        } else {
            this.on({
                ready: fn,
                scope: scope,
                single: true
            });
        }
    },
    getDesktopConfig : function(){
        var me = this,
            cfg = {
                app  : me ,
                taskbarConfig : me.getTaskbarConfig()
            };
        Ext.apply(cfg, me.desktopConfig);
        return cfg;

    },
    onUnload : function(e){
        if(this.fireEvent('beforeunload',this) === false){
            e.stopEvent();
        }

    },
    getModules: Ext.emptyFn,
    initModules : function (modules) {
        var me = this;
        Ext.each(modules,function(module){
            module.app = me;
        });
        
    },
    getModule : function(moduleName){
        var myModules = this.modules;
        for (var i = 0, length = myModules.length; i < length; i++) {
            var module = myModules[i];
            if (module.id == moduleName || module.appType == moduleName) {
                return module
            }
        }
        return null;
    },
    getTaskbarConfig:  function(){
        var me = this,
            cfg = {
                app: me,
                startConfig : me.getStartConfig()
            };
        Ext.apply(cfg , me.taskbarConfig);
        return cfg;
    },
    getStartConfig: function(){
        var me = this,
            cfg = {
                app: me,
                menu : []
            },
            launcher;
        Ext.apply(cfg,me.startConfig);
        Ext.each(me.modules,function(module){
            launcher = module.launcher;

            if(launcher ){
                launcher.handler = launcher.handler || Ext.bind(me.createWindow, me, [module]);
                cfg.menu.push(module.launcher)

            }
        });
        return cfg;

    },
    createWindow : function(module){
        var window = module.createWindow();
        window.show();
    },
    getDesktop : function(){
        return this.desktop
    }

});
