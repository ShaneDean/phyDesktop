/**
 * Created by phy on 2016/8/8.
 */
Ext.define('PhyDesktop.desktop.ShortcutModel',{
    extend: "Ext.data.Model",
    identifier: 'uuid',
    fields:[
        {name:'uuid'},          //uuid
        {name:'id'},            //快捷方式在桌面的id
        {name:'name'},          //这个应用的名字
        {name:'title'},         //这个应用的打开后窗口的名字
        {name:'iconUrl'},       //图标的地址
        {name:'iconCls'},       //图标的样式
        {name:'appUrl'},        //这个应用的实际地址
        {name:'module'},        //暂未使用
        {name:'width'},         //快捷键宽度
        {name:'height'},        //快捷键高度
        {name:'isResize'},      //是否可以重新调整大小
        {name:'maximizable'},   //是否可以最大化、最小化
        {name:'resizable'}      //不知道
    ]
})