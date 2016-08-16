/**
 * Created by phy on 2016/8/16.
 */

Ext.define('PhyDesktop.phy.SystemSetting',{
    extend: 'Ext.window.Window',

    uses:[
        'Ext.tree.Panel',
        'Ext.tree.View',
        'Ext.form.field.Checkbox',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.Border',

        'PhyDesktop.desktop.Wallpaper',
        'PhyDesktop.desktop.WallpaperModel'
    ],
    layout : 'anchor',
    title: '桌面背景',
    //iconCLs: 'background-setting',
    modal: true,
    width : 640,
    height: 480,
    border: false,

    initComponent : function(){
        var me = this;
        me.selected = me.desktop.wallpaper.wallpaper;
        me.stretch = me.desktop.wallpaper.stretch;


        me.preview = Ext.create('widget.wallpaper');
        me.preview.setWallpaper(me.selected);
        me.tree = me.createTree();
        me.buttons = [
            { text: '确定', handler: me.onOK, scope: me },
            { text: '取消', handler: me.close, scope: me }
        ];

        me.items = [
            {
                anchor: '0 -30',
                border: false,
                layout: 'border',
                items: [
                    me.tree,
                    {
                        xtype: 'panel',
                        title: '预览',
                        region: 'center',
                        layout: 'fit',
                        items: [ me.preview ]
                    }
                ]
            },
            {
                xtype: 'checkbox',
                boxLabel: '伸展适应',
                checked: me.stretch,
                listeners: {
                    change: function (comp) {
                        me.stretch = comp.checked;
                    }
                }
            }
        ];

        me.callParent();

    },
    createTree: function(){
        var me = this;

        function child (img) {
            return { img: img, text: me.getTextOfWallpaper(img), iconCls: '', leaf: true };
        }

        var tree = new Ext.tree.Panel({
            title: '桌面背景',
            rootVisible: false,
            lines: false,
            autoScroll: true,
            width: 150,
            region: 'west',
            split: true,
            minWidth: 100,
            listeners: {
                afterrender: { fn: this.setInitialSelection, delay: 100 },
                select: this.onSelect,
                scope: this
            },
            store: new Ext.data.TreeStore({
                model: 'PhyDesktop.desktop.WallpaperModel',
                root: {
                    text:'Wallpaper',
                    expanded: true,
                    children:[
                        { text: "None", iconCls: '', leaf: true },
                        child('Blue-Sencha.jpg'),
                        child('Dark-Sencha.jpg'),
                        child('Wood-Sencha.jpg'),
                        child('blue.jpg'),
                        child('desk.jpg'),
                        child('desktop.jpg'),
                        child('desktop2.jpg'),
                        child('sky.jpg'),
                        child('civic.jpg')
                    ]
                }
            })
        });

        return tree;
    },

    getTextOfWallpaper: function (path) {
        var text = path, slash = path.lastIndexOf('/');
        if (slash >= 0) {
            text = text.substring(slash+1);
        }
        var dot = text.lastIndexOf('.');
        text = Ext.String.capitalize(text.substring(0, dot));
        text = text.replace(/[-]/g, ' ');
        return text;
    },

    onOK: function () {
        var me = this;
        if (me.selected) {
            me.desktop.setWallpaper(me.selected, me.stretch);
        }
        me.destroy();
    },

    onSelect: function (tree, record) {
        var me = this;

        if (record.data.img) {
            me.selected = '/resources/img/wallpapers/' + record.data.img;
        } else {
            me.selected = Ext.BLANK_IMAGE_URL;
        }

        me.preview.setWallpaper(me.selected);
    },

    setInitialSelection: function () {
        var s = this.desktop.wallpaper.wallpaper;
        if (s) {
            var path = '/resources/img/wallpapers/' + this.getTextOfWallpaper(s);
            this.tree.selectPath(path, 'text');
        }
    }


});
