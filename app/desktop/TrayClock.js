/**
 * Created by phy on 2016/8/8.
 */

Ext.define('PhyDesktop.desktop.TrayClock',{
    extend: 'Ext.toolbar.TextItem',
    alias: 'widget.trayclock',
    cls: 'ux-desktop-trayclock',
    html: "&#160;",
    timeFormat: "g:i A",
    tpl: "{time}",
    getWeek: function(){
        var weekList = new Array("星期日", "星期一", "星期二",
                                    "星期三", "星期四", "星期五",
                                        "星期六");
        var formatTime =  new Date().getDay();


        return (weekList[formatTime]);
    },
    initComponent: function(){
        var me = this;
        me.callParent();
        if( typeof(me.tpl) == "string"){
            me.tpl = new Ext.XTemplate(me.tpl)
        }
    },
    afterRender: function(){
        var me = this;
        Ext.Function.defer(me.updateTime, 100, me);
        me.callParent();
    },
    updateTime : function(){
        var me = this,
            week = me.getWeek() + "&nbsp;" + Ext.Date.format(new Date, me.timeFormat),
            text = me.tpl.apply({time: week});
        if(me.lastText != text){
            me.setText(text);
            me.lastText = text;
        }
        me.timer = Ext.Function.defer(me.updateTime, 10000, me);

    }
});