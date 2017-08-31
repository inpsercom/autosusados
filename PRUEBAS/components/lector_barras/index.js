/*--------------------------------------------------------------------
Fecha: 21/08/2017
Detalle: 
Captura la imagen de la placa y obtiene los datos
Selecciona una placa y obtiene los datos
Escanea el codigo de barras del automovil, recupera el chasis y obtiene los datos
Autor: RRP
--------------------------------------------------------------------*/
'use strict';

var resp = "Error";
var respimagen;



app.lector_barras = kendo.observable({
    onShow: function () {
        onDeviceReady();
    },
    afterShow: function () { }
});
app.localization.registerView('lector_barras');

// START_CUSTOM_CODE_lector_barras
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    $(document).ready(function () {
        $("#tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
    });

    document.getElementById("smallImage").style.display = 'none';
    document.getElementById("smallImage").style.visibility = 'hidden';
    document.getElementById("result").style.visibility = 'hidden';
    document.getElementById("vehiculo").style.visibility = 'hidden';

    navigator.splashscreen.hide();
    var app = new App();
    app.run();
}

function App() { }

App.prototype = {
    resultsField: null,


    _pictureSource: null,
    _destinationType: null,

    run: function () {
        var that = this,
            scanButton = document.getElementById("scanButton");

        //RRP: boton captura placa -----------------------------
        var capturePhotoButton = document.getElementById("capturePhotoButton");

        capturePhotoButton.addEventListener("click",
            function () {
                that._pictureSource = navigator.camera.PictureSourceType;
                that._destinationType = navigator.camera.DestinationType;
                that._capturePhoto.apply(that, arguments);
            });

        //RRP: boton captura placa -----------------------------

        that.resultsField = document.getElementById("result");

        scanButton.addEventListener("click",
            function () {
                document.getElementById("smallImage").style.display = 'none';

                document.getElementById("smallImage").style.visibility = 'hidden';
                document.getElementById("result").style.visibility = 'hidden';
                document.getElementById("vehiculo").style.visibility = 'hidden';
                that._scan.call(that);
            });
    },

    _scan: function () {
        var that = this;
        try {
            if (window.navigator.simulator === true) {
                window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ERROR</center>", "Aplicación no compatible.");
            } else {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        if (!result.cancelled) {
                            that._addMessageToLog(result.format, result.text);
                        }
                    },
                    function (error) {
                        // ERROR: SCAN  is already in progress   
                      //  window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "No se realizó el escaneo. Intentelo nuevamente.");

                    });
            }
        } catch (e) {
            alert(e);
        }
    },

    _addMessageToLog: function (format, text) {
        //var that = this,
        //    currentMessage = that.resultsField.innerHTML,
        //    html = '<input type="text" id="txtResPlaca" value="' + text + '"/>';
        //that.resultsField.innerHTML = html;

        TraerInformacion(text, "C");
    },

    //-------------------------------------------

    _capturePhoto: function () {
        var that = this;

        // Take picture using device camera and retrieve image as base64-encoded string.
        navigator.camera.getPicture(function () {

            document.getElementById("result").style.visibility = 'hidden';
            document.getElementById("vehiculo").style.visibility = 'hidden';

            that._onPhotoDataSuccess.apply(that, arguments);
        }, function () {
            that._onFail.apply(that, arguments);
        }, {
            //quality: 20,
            //targetWidth: 1000,
            //targetHeight: 1000,
            allowEdit: true,

            destinationType: that._destinationType.FILE_URI,

            //   destinationType: that._destinationType.DATA_URL,
            correctOrientation: true,
            saveToPhotoAlbum: true // RRP: Guarda la imagen en el album
        });
    },


    _onPhotoDataSuccess: function (imageURI) {

        alert(imageURI);

        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';

        smallImage.style.visibility = 'visible';
        // Show the captured photo.
        smallImage.src = imageURI;

        uploadPhoto(imageURI);

        //  document.getElementById("smallImage").style.visibility = 'visible';
    },

    //_onPhotoDataSuccess: function (imageData) {
    //    var smallImage = document.getElementById('smallImage');
    //    smallImage.style.display = 'block';

    //    smallImage.style.visibility = 'visible';
    //    // Show the captured photo.
    //    smallImage.src = "data:image/jpeg;base64," + imageData;
    //  //  document.getElementById("smallImage").style.visibility = 'visible';
    //},


    _onFail: function (message) {
        // no se tomo la foto
        // window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "No se ha guardado ninguna imagen. Intentelo nuevamente.");
    }

}



/*--------------------------------------------------------------------
Fecha: 16/08/2017
Detalle: Obtiene la informacion a traves del Chasis
Autor: RRP
--------------------------------------------------------------------*/
function TraerInformacion(responseText, tipo) {

    document.getElementById("result").style.visibility = 'visible';

    var intResult = 0;

    try {
        var Url = "";

        if (tipo == "P") {
            // Placa
            Url = wsInfoVehiculo + "2,1;;;;;;" + responseText + ";;JSON;";
        } else {
            // Chasis
            Url = wsInfoVehiculo + "2,1;;;;;" + responseText + ";;;JSON;";
        }

        var infor;
        $.ajax({
            url: Url,
            type: "GET",
            async: false,
            dataType: "json",
            success: function (data) {
                try {
                    infor = (JSON.parse(data.BuscarGetResult)).VehiculoModel;
                    intResult = 1;

                } catch (e) {
                    window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "No existen datos\nCódigo: " + responseText);
                    return;
                }
            },
            error: function (err) {
                window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "Error durante el proceso. Intentelo nuevamente.");
                return;
            }

        });

        //------------------------

        if (intResult > 0) {

            /*-----------------------------------
            Carga grid
            -------------------------------------
            //$("#vehiculo").kendoGrid({
            //    allowCopy: true,
            //    columns: [
            //        { field: "chasis", title: "Chasis" },
            //        { field: "nombre_modelo", title: "Modelo" },
            //        { field: "color_vehiculo", title: "Color" }

            //    ],
            //    dataSource: {
            //        data: infor
            //    },
            //    selectable: "row"
            //});
            -----------------------------------*/

            //form

            var dataSource = new kendo.data.DataSource({
                data: infor,
                aggregate: [{
                    field: "chasis",
                    aggregate: "count"
                }]
            });


            dataSource.fetch(function () {

                var numReg = dataSource.aggregates().chasis;

              //  alert(numReg.count);

                if (numReg.count == 1) {
                    // Toma la primera fila
                    var infoVehiculo = dataSource.at(0);
                    var viewModel = kendo.observable({
                        placa: infoVehiculo.placa,
                        chasis: infoVehiculo.chasis,
                        codigo_marca: infoVehiculo.codigo_marca,
                        nombre_color: infoVehiculo.nombre_color,
                        anio_modelo: infoVehiculo.anio_modelo,
                        color_vehiculo: infoVehiculo.color_vehiculo,
                        nombre_propietario: infoVehiculo.nombre_propietario,

                        mi_modelo: infoVehiculo.nombre_modelo  + " (" + infoVehiculo.codigo_modelo + ")",

                        startOver: function () {
                            //this.set("confirmed", false);
                            //this.set("agreed", false);
                            //this.set("gender", "Male");
                            this.set("placa", "");
                            this.set("chasis", "");
                            this.set("codigo_marca", "");
                            this.set("nombre_color", "");
                            this.set("anio_modelo", "");
                            this.set("color_vehiculo", "");
                            this.set("nombre_propietario", "");
                        }
                    });

                } else {
                    window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "Error durante el proceso. Intentelo nuevamente.");
                }
                kendo.bind($("#datosVEH"), viewModel);
            });
            //end form

            document.getElementById("result").style.visibility = 'visible';
            document.getElementById("vehiculo").style.visibility = 'visible';
        }


        //------------------------

        //  return infor[0].path_prefactura;
    } catch (e1) {
        alert(e1);
    }
}


function inspeccionar(obj) {
    try {
        var msg = '';
        for (var property in obj) {
            if (typeof obj[property] == 'function') {
                var inicio = obj[property].toString().indexOf('function');
                var fin = obj[property].toString().indexOf(')') + 1;
                var propertyValue = obj[property].toString().substring(inicio, fin);
                msg += (typeof obj[property]) + ' ' + property + ' : ' + propertyValue + ' ;\n';
            } else if (typeof obj[property] == 'unknown') {
                msg += 'unknown ' + property + ' : unknown ;\n';
            } else {
                msg += (typeof obj[property]) + ' ' + property + ' : ' + obj[property] + ' ;\n';
            }
        }
        return msg;
    } catch (e) {
        alert(e);
    }
}


/*--------------------------------------------------------------------
Fecha: 18/08/2017
Detalle: Captura la imagen y la sube a un repositorio
Autor: RRP
--------------------------------------------------------------------*/
function getImage() {
    document.getElementById("smallImage").style.display = 'none';
    document.getElementById("smallImage").style.visibility = 'hidden';

    //document.getElementById("smallImage").style.visibility = 'visible';
    document.getElementById("result").innerHTML = "";
    document.getElementById("vehiculo").innerHTML = "";
    document.getElementById("vehiculo").style.visibility = 'hidden';

    //  smallImage.style.display = 'none';

    navigator.camera.getPicture(uploadPhoto, function (message) {

        window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "No ha seleccionado una imagen. Inténtelo nuevamente.");
        //   alert('ALERTA: No ha seleccionado una imagen. Inténtelo nuevamente.');
    }, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
    });
}


/*--------------------------------------------------------------------
Fecha: 18/08/2017
Detalle: Alerta con formato
Autor: RRP
--------------------------------------------------------------------*/
function myalert(titulo, contenido) {
    $("<div></div>").kendoAlert({
        title: titulo,
        content: contenido
    }).data("kendoAlert").open();
}

/*--------------------------------------------------------------------
Fecha: 29/08/2017
Detalle: Guarda el archivo seleccionado (imagen en este caso) en un repositorio (ASMX)
Autor: RRP
--------------------------------------------------------------------*/
function uploadPhoto(imageURI) {

    // Presenta la imagen seleccionada
    var smallImage = document.getElementById('smallImage');
    smallImage.style.display = 'block';
    smallImage.style.visibility = 'visible';
    smallImage.src = imageURI;

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1).replace('.jpg', '');

    // variable global
    resp = imageURI.substr(imageURI.lastIndexOf('/') + 1).replace('.jpg', '');

    options.mimeType = "image/jpeg";
    console.log(options.fileName);
    var params = new Object();
    params.value1 = "test";
    params.value2 = "param";
    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    // alert(imageURI);
    ft.upload(imageURI, "http://ecuainfo78-002-site3.btempurl.com/FileUpload.asmx/SaveImage", win, fail, options);
}


function win(r) {
    MIshowHint(resp);
    //console.log("Code = " + r.responseCode);
    //console.log("Response = " + r.response);
    //alert("Sent = " + r.response);
}

function fail(error) {
    window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ERROR</center>", "La imagen no se ha guardado correctamente. Inténtelo nuevamente.");

    // alert('ERROR: La imagen no se ha guardado correctamente. Inténtelo nuevamente.');
}


/*--------------------------------------------------------------------
Fecha: 15/08/2017
Detalle: Extrae el texto de la placa de una imagen seleccionada
Autor: RRP
--------------------------------------------------------------------*/
function MIshowHint(str) {
    str = str.replace("%", "_");
    str = str + ".jpg";

    var data = new FormData();
    if (str.length > 0) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
               document.getElementById("result").innerHTML = this.responseText;

                var answ = document.getElementById("txtResPlaca").value;

                document.getElementById("result").innerHTML ="";

                if (answ == "ERROR") {

                    window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ALERTA</center>", "Error durante el proceso. Intentelo nuevamente.");

                    //document.getElementById("result").innerHTML = "<i class=\"fa fa-exclamation-triangle\"></i> Error durante el proceso. Intentelo nuevamente.";
                    //document.getElementById("result").style.visibility = 'visible';
                } else {
                    TraerInformacion(answ, "P");
                }
            }
        };

        xmlhttp.open("GET", "http://ecuainfo78-002-site6.btempurl.com/index.aspx?q=" + str, true);
        xmlhttp.send();
    } else {
        window.myalert("<center><i class=\"fa fa-exclamation-triangle\"></i> ERROR</center>", "La imagen no se ha procesado correctamente. Inténtelo nuevamente.");

        // alert('ERROR: La imagen no se ha procesado correctamente. Inténtelo nuevamente.');
    }
}


/*--------------------------------------------------------------------
Fecha: 04/08/2017
Detalle: Sube la imagen selecionada a un repositorio (PHP)
Autor: RRP
--------------------------------------------------------------------*/
//function uploadPhoto(imageURI) {

//    var options = new FileUploadOptions();
//    options.fileKey = "file";
//    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1).replace('.jpg', '');

//    // variable global
//    resp = imageURI.substr(imageURI.lastIndexOf('/') + 1).replace('.jpg', '');

//    options.mimeType = "image/jpeg";
//    console.log(options.fileName);
//    var params = new Object();
//    params.value1 = "test";
//    params.value2 = "param";
//    options.params = params;
//    options.chunkedMode = false;

//    var ft = new FileTransfer();

//    ft.upload(imageURI, "http://ecuainfo78-002-site4.btempurl.com/upload.php",
//        win,
//        function (error) { document.getElementById("result").innerHTML = "Ha ocurrido un error. Inténtelo nuevamente."; }, options);

//    var smallImage = document.getElementById('smallImage');
//    smallImage.style.display = 'block';
//    // Show the captured photo.
//    smallImage.src = imageURI;
//}

//function win(r) {
//    MIshowHint(resp);
//}

//function fail(error) {
//    alert("An error has occurred: Code = " + error.value);
//}



// END_CUSTOM_CODE_lector_barras