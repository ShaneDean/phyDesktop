/**
 * Created by phy on 2016/8/12.
 */

Ext.define('PhyDesktop.Config',{

    alias: 'Phy.config',
    statics:{
        apps:{
            fm  :{
                id      :   'id_fm',
                name    :   'fm',
                appUrl  :   '/webapp/fm.html',
                //appUrl  :   'http://172.16.6.212/fm/',
                title   :   '文件管理系统',
                iconUrl :   '/resources/img/shortcuts/fm.png',
                iconCls :   'shortcuts_fm',
                module  :   '',
                width   :   950,
                height  :   580,
                isResize    : true,
                maximizable : true,
                resizable   : true

            },
            rtc :{
                id      : 'id_rtc',
                name    : 'RTC',
                appUrl  :   '/webapp/rtc.html',

                //appUrl  : 'https://172.16.6.205:9443/ccm/',
                title   : 'IBM_RTC',
                iconUrl :  '/resources/img/shortcuts/rtc.png',
                iconCls :  'shortcuts_rtc',
                module  :  '',
                width   :  950,
                height  :  580,
                isResize    : true,
                maximizable : true,
                resizable   : true
            } ,
            bing:{
                id      : 'id_bing',
                name    : 'bing',
                appUrl  :   '/webapp/bing.html',

                //appUrl  : 'http://cn.bing.com/',
                title   : '必应搜索',
                iconUrl :  '/resources/img/shortcuts/bing.png',
                iconCls :  'shortcuts_bing',
                module  :  '',
                width   :  950,
                height  :  580,
                isResize    : true,
                maximizable : true,
                resizable   : true
            } ,
            ovirt :{
                id      : 'id_ovirt',
                name    : 'ovirt',
                appUrl  :   '/webapp/bing.html',

                //appUrl  : 'https://172.16.7.230/',
                title   : '虚拟资源管理系统',
                iconUrl :  '/resources/img/shortcuts/ovirt.png',
                iconCls :  'shortcuts_ovirt',
                module  :  '',
                width   :  950,
                height  :  580,
                isResize    : true,
                maximizable : true,
                resizable   : true
            }


        }

    }
});