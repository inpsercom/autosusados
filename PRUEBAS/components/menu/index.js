'use strict';

app.menu = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});
app.localization.registerView('menu');

// START_CUSTOM_CODE_menu_principal
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

function abrirPagina(vista) {
    kendo.mobile.application.navigate("components/" + vista + "/view.html");
}

// END_CUSTOM_CODE_menu_principal

