
let db;
let objectStore;
let motos;
let carros;
let pesados;

class vehiculos {

    _velocidad = 0;
    _entregas_pendientes = 0;
    _combustible = 0;
    _movimiento = "Detenido";
    _direccion = "Linea recta";
    _luces = "Apagadas";
    static id = 0;
    constructor(nombre, idPropietario, tipo, color, marca, capPeso, precio, pasajeros, matricula, peso) {
        this.id = ++vehiculos.id;
        this.nombre = nombre;
        this.idPropietario = idPropietario;
        this.tipo = tipo;
        this.color = color;
        this.marca = marca;
        this.capPeso = capPeso;
        this.precio = precio;
        this.pasajeros = pasajeros;
        this.matricula = matricula;
        this.peso = peso;
    }

    get velocidad() {
        return this._velocidad;
    }
    set velocidad(velocidad) {
        this._velocidad = velocidad
    }

    get entregas_pendientes() {
        return this._entregas_pendientes;
    }
    set entregas_pendientes(entregas_pendientes) {
        this._entregas_pendientes = entregas_pendientes
    }
    get combustible() {
        return this._combustible;
    }
    set combustible(combustible) {
        this._combustible = combustible
    }

    get movimiento() {
        return this._movimiento;
    }
    set movimiento(movimiento) {
        this._movimiento = movimiento;
    }

    get direccion() {
        return this._direccion;
    }
    set direccion(direccion) {
        this._direccion = direccion;
    }

    get luces() {
        return this._luces;
    }
    set luces(luces) {
        this._luces = luces;
    }

    //NO MODIFICAR DIRECTAMENTE LOS ATRIBUTOS USAR SETTERS
    /*EncenderLuces() {
        this._luces = "encendidas";
        // console.log("encendi luces")
    }
    ApagarLuces() {
        this._luces = "apagadas";
        // console.log("apague luces")
    }*/
}

// Solicitar la apertura de una base de datos
let request = indexedDB.open("MiBaseDeDatos", 1);
request.onupgradeneeded = function (event) {
    // Esta función se ejecuta si la base de datos no existe o si se incrementa la versión
    db = event.target.result;
    // Crear un almacén de objetos (equivalente a una tabla en SQL)
    if (!db.objectStoreNames.contains("usuarios")) {
        objectStore = db.createObjectStore("usuarios", { keyPath: "idPropietario" });
        objectStore.createIndex("tipoIndex", "tipo");
    }
};
request.onsuccess = function (event) {
    // La base de datos se abrió correctamente
    db = event.target.result;
    request.onerror = function (event) {
        console.error("Error al añadir usuario:", event.target.error);
    };
    // Aquí puedes realizar operaciones con la base de datos
};

function agregarUsuario(db, usuario) {
    // Iniciar una transacción de escritura
    let transaction = db.transaction(["usuarios"], "readwrite");
    // // Obtener el almacén de objetos
    let store = transaction.objectStore("usuarios");

    let request = store.add(usuario);
    request.onsuccess = function () {
        alert("Vehiculo añadido con éxito")
        // console.log("Usuario añadido con éxito");
    };
    request.onerror = function (event) {
        console.error("Error al añadir usuario:", event.target.error);
        alert("No se ha añadido el usuario", event.target.error)
        //alert("Error al añadir usuario:"+ event.target.error)
    };
}


function agregarVehiculo() {//AGREGAR EL OBJETO A LA DB
    const forma = document.forms['forma'];
    const nombre = forma['inputName'];
    const idPropietario = forma['inputid'];
    const tipo = forma['inputTipo'];
    const color = forma['inputColor'];
    const marca = forma['inputMarca'];
    const capPeso = forma['inputCapPeso'];
    const precio = forma['inputPrecio'];
    const pasajeros = forma['inputPasajeros'];
    const matricula = forma['inputMatricula'];
    const peso = forma['inputPeso'];
    const miVehiculo = new vehiculos(nombre.value, idPropietario.value, tipo.value,
        color.value, marca.value, capPeso.value,
        precio.value, pasajeros.value, matricula.value, peso.value);
    agregarUsuario(db, miVehiculo);

}



function filtros(dato) {//EXTRAIGO LA INFORMACION DE LA BASE DE DATOS FILTRANDO POR EL TIPO DE VEHICULO
    let transaction = db.transaction(["usuarios"], "readonly");
    let objectStore = transaction.objectStore("usuarios");
    let tipoIndex = objectStore.index("tipoIndex"); // Acceder al índice "tipoIndex"
    let range = IDBKeyRange.only(dato);

    return new Promise((resolve, reject) => {
        const request = tipoIndex.getAll(range);
        request.onsuccess = function (event) {
            const registros = event.target.result;
            resolve(registros); // Resuelve la promesa con los datos
        };
        request.onerror = function (event) {
            reject(event.target.error); // Rechaza la promesa si hay un error
            alert("ERROR AL GRABAR ")
        };
    });
}

const eliminarStado = document.getElementById("eliminarhtml")
if (eliminarStado != null) {
    document.getElementById("tbody").innerHTML = "";
    let vehiculos, flag = 0;
    function obtenerUsuario() {//LLENO LA TABLA DE VEHICULOS
        filtros("Moto")
            .then(registros => {// Hacer algo con los datos
                crearFilas(registros);
            })
            .catch(error => {// Manejar errores
                console.error(error);
            });
        filtros("Carro")
            .then(registros => {// Hacer algo con los datos
                crearFilas(registros);
            })
            .catch(error => {
                console.error(error);// Manejar errores
            });

        filtros("Pesado")
            .then(registros => {
                crearFilas(registros);
            })
            .catch(error => {
                console.error(error);
            });
    }
    //ESPERO A QUE SE ABRA CORRECTAMENTE LA DB
    setTimeout(function () { obtenerUsuario() }, 100);
}
else {
    console.log(eliminarStado);
}

function crearFilas(registro) {
    for (const element of registro) {
        agregarFila(element);
    }
}

function agregarFila(Vehiculo) {
    let detallesVehiculo = "";
    detallesVehiculo = "<b>TIPO DE VEHÍCULO: </b>"
        + Vehiculo.tipo + "<b><br/>PROPIETARIO:</b> "
        + Vehiculo.nombre + "<b><br/>ID VEHÍCULO: </b>"
        + Vehiculo.idPropietario.toString() + "<b><br/>MATRÍCULA:</b> "
        + Vehiculo.matricula + "<b><br/>COLOR:</b> "
        + Vehiculo.color + "<b><br/>MARCA:</b> "
        + Vehiculo.marca + "<b><br/>CAPACIDAD DE CARGA: </b>"
        + Vehiculo.capPeso.toString() + "Tn <b><br/>PRECIO: </b>$"
        + Vehiculo.precio.toString() + "<b><br/>CAP DE PASAJEROS: </b>"
        + Vehiculo.pasajeros.toString() + "<b><br/>PESO DE VEHÍCULO: </b>"
        + Vehiculo.peso.toString() + "Kg";

    //console.log(typeof (detallesVehiculo))
    let table = document.getElementById('tbody');
    let filas = table.insertRow(-1);

    filas.innerHTML =
        `<td>${Vehiculo.tipo}</td>
        <td ">${Vehiculo.matricula}</td>
        <td class="idProp">${Vehiculo.idPropietario}</td>
        <td class="dropdown-menu-start  ">
            <button  class="border-0 bg-transparent" data-bs-toggle="dropdown"><iclass="bi bi-info-circle-fill "></i></button>
            <div class="dropdown-menu overflow-auto mw-100">
                <p  class="dropdown-item " id="detalles">${detallesVehiculo}</p>
            </div>
        </td>
        <td id="eliminar">
            <button onclick="btnEliminar(this)" class="border-0 bg-transparent"><i class="bi bi-trash3-fill"></i></button>
        </td>`
}


function btnEliminar(event) {
    let seleccion = event.closest("tr");
    let idProp = seleccion.getElementsByClassName("idProp")[0].innerHTML;
    console.log(idProp);

    //Iniciar una transacción con la DB
    let transaction = db.transaction(["usuarios"], "readwrite");
    // Obtener el almacén de objetos
    let store = transaction.objectStore("usuarios");
    //ELIMINAR EL OBJETO DE IDPROPIETARIO
    const deleteRequest = store.delete(idProp);

    deleteRequest.onsuccess = function () {
        console.log("Dato eliminado correctamente");
        alert("Vehículo eliminado correctamente")
    };
    deleteRequest.onerror = function (event) {
        console.error("Error al eliminar el dato:", event.target.error);
        alert("Error al eliminar Vehículo", event.target.error);
    };

    // Cerrar la transacción
    transaction.oncomplete = function () {
        console.log("Transacción completada");
    };
    transaction.onerror = function (event) {
        console.error("Error en la transacción:", event.target.error);
    };
    //ACTUALIZAR PA PAGINA PARA ACTUALIZAR LA TABLA
    location.reload();
}

// Seleccionamos el elemento input
const input = document.getElementById('inputid');
// Añadimos un event listener para el evento 'input'
if (input != null) {
    input.addEventListener('input', function (event) {
        // Llamamos a la función que queremos ejecutar
        procesarInput(event.target.value);
    });
}

// Función que se ejecuta mientras el usuario escribe
//FUNCION PARA QUE NO SE PUEDA ESCRIBIR UN ID DE PROPIETARIO QUE YA EXISTA
function procesarInput(valor) {
    // Aquí puedes hacer lo que necesites con el valor del input
    //Iniciar una transacción con la DB (CONECTARNOS A LA DB)
    let transaction = db.transaction(["usuarios"], "readwrite");
    // Obtener el almacén de objetos
    let store = transaction.objectStore("usuarios");

    let request2 = store.getAll();
    request2.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            for (const element of cursor) {
                if (element.idPropietario === valor) {
                    if (document.getElementById("agregar") != null) {
                        document.getElementById("inputIdLabel").innerHTML = "ID ya existe"
                        document.getElementById('inputIdLabel').style.color = "red"
                        document.getElementById('guardar').disabled = true;
                    }
                    else if (document.getElementById("conductor") != null) {
                        document.getElementById("inputIdLabel").innerHTML = "ID de vehículo"
                        document.getElementById('inputIdLabel').style.color = "black"
                        document.getElementById('guardar').disabled = false;
                    }
                    break;
                }
                else {
                    if (document.getElementById("agregar") != null) {
                        document.getElementById("inputIdLabel").innerHTML = "ID de vehículo"
                        document.getElementById('inputIdLabel').style.color = "black"
                        document.getElementById('guardar').disabled = false;
                    }
                    else if (document.getElementById("conductor") != null) {
                        document.getElementById("inputIdLabel").innerHTML = "ID NO VALIDO"
                        document.getElementById('inputIdLabel').style.color = "red"
                        document.getElementById('guardar').disabled = true;
                    }
                }
            }
        }
    };
}

function estadoVehiculo(elementAux) {
    let estadoVeh = "<b>Velocidad: </b>" + elementAux._velocidad + " km/h<br>" +
        "<b>Combustible: </b>" + elementAux._combustible + "%<br>" +
        "<b>Entregas Pendientes: </b>" + elementAux._entregas_pendientes + "<br>" +
        "<b>Estado de Movimiento: </b>" + elementAux._movimiento + "<br>" +
        "<b>Estado de Dirección: </b>" + elementAux._direccion + "<br>" +
        "<b>Estado de Luces: </b>" + elementAux._luces;
    return estadoVeh;
}

const consultar = document.getElementById('consultar');
if (consultar != null) {
    let vehiculoSelec = sessionStorage.getItem("vehiculo");
    //console.log(typeof(vehiculoSelec));
    function graficar() {//Crear un card por cada vehiculo
        console.log(typeof (vehiculoSelec));
        let mensaje = document.getElementById('ho1');
        if (vehiculoSelec == "1") {
            filtros("Moto")
                .then(registros => {
                    if (registros.length) {
                        mensaje.innerHTML = "A CONTINUACIÓN VERÁS EL ESTADO ACTUAL DE TUS VEHÍCULOS TIPO MOTO";
                        for (const element of registros) {
                            let info = estadoVehiculo(element);
                            createCard("ID VEHÍCULO: " + element.idPropietario, info);
                        }
                    }
                    else { mensaje.innerHTML = "AÚN NO HAY VEHÍCULOS DE TIPO MOTO PARA CONSULTAR"; }
                })
                .catch(error => {
                    console.error(error);
                });
        }

        else if (vehiculoSelec == "2") {
            filtros("Carro")
                .then(registros => {
                    if (registros.length) {
                        mensaje.innerHTML = "A CONTINUACIÓN VERÁS EL ESTADO ACTUAL DE TUS VEHÍCULOS TIPO CARRO";
                        for (const element of registros) {
                            let info = estadoVehiculo(element);
                            createCard("ID VEHICULO: " + element.idPropietario, info);
                        }
                    }
                    else { mensaje.innerHTML = "AÚN NO HAY VEHÍCULOS DE TIPO CARRO PARA CONSULTAR"; }
                })
                .catch(error => {
                    console.error(error);
                });
        }
        else if (vehiculoSelec == "3") {
            filtros("Pesado")
                .then(registros => {
                    if (registros.length) {
                        mensaje.innerHTML = "A CONTINUACIÓN VERÁS EL ESTADO ACTUAL DE TUS VEHÍCULOS TIPO PESADO";
                        for (const element of registros) {
                            let info = estadoVehiculo(element);
                            createCard("ID VEHICULO: " + element.idPropietario, info);
                        }
                    }
                    else { mensaje.innerHTML = "AÚN NO HAY VEHÍCULOS DE TIPO PESADO PARA CONSULTAR"; }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }
    setTimeout(function () { graficar() }, 100);
}
// Función para crear una tarjeta

function enlaceMoto() {
    sessionStorage.setItem("vehiculo", "1")
    window.location.href = 'https://oscarandd.github.io/EmpresaTransporteResponsiva/consultar.html';
}
function enlaceCarro() {
    sessionStorage.setItem("vehiculo", "2")
    window.location.href = 'https://oscarandd.github.io/EmpresaTransporteResponsiva/consultar.html';
}
function enlacePesado() {
    sessionStorage.setItem("vehiculo", "3")
    window.location.href = 'https://oscarandd.github.io/EmpresaTransporteResponsiva/consultar.html';
}


function createCard(title, content) {
    let containergen = document.getElementById('containergen');
    // Crear el elemento div de la tarjeta
    const column = document.createElement('div');
    column.classList.add('col');
    column.classList.add('mb-3');

    const card = document.createElement('div');
    card.classList.add('card');
    //card.classList.add('text-bg-dark');
    card.classList.add('h-100');
    card.classList.add('border-black');
    card.classList.add('px-2');

    const cardheader = document.createElement('div');
    cardheader.classList.add('card-header');

    // Crear el título de la tarjeta
    const contentheader = document.createElement('p');
    contentheader.textContent = title;
    //guardo el contenido del header en el div de header
    cardheader.appendChild(contentheader);

    // Crear el contenido de la tarjeta
    const cardContent = document.createElement('p');
    cardContent.innerHTML = content;
    //cardContent.textContent = content;

    // Agregar título y contenido a la tarjeta
    card.appendChild(cardheader);
    card.appendChild(cardContent);

    // Agregar la tarjeta al contenedor
    column.appendChild(card);
    containergen.appendChild(column);
}

function actualizarEstado() {
    vehiculos.velocidad = document.getElementById("inputVelocidad").value;
    vehiculos.entregas_pendientes = document.getElementById("inputPendientes").value;
    vehiculos.combustible = document.getElementById("inputCombustible").value;
    vehiculos.movimiento = document.getElementById("inputMovimiento").value;
    vehiculos.direccion = document.getElementById("inputDireccion").value;
    vehiculos.luces = document.getElementById("inputLuces").value;
    // Open (or create) the database
    var request = indexedDB.open("MiBaseDeDatos", 1);
    request.onsuccess = function (event) {
        var db = event.target.result;

        // Start a new transaction
        var transaction = db.transaction(["usuarios"], "readwrite");

        // Get the object store
        var objectStore = transaction.objectStore("usuarios");

        // Get the record to update
        const idVehiculo = document.getElementById("inputid").value;
        var getRequest = objectStore.get(idVehiculo); // Assuming the id is 1

        getRequest.onsuccess = function (event) {
            // Update only the necessary fields
            var data = getRequest.result;

            console.log(data);
            data._combustible = vehiculos.combustible;
            data._direccion = vehiculos.direccion;
            data._entregas_pendientes = vehiculos.entregas_pendientes;
            data._luces = vehiculos.luces;
            data._movimiento = vehiculos.movimiento;
            data._velocidad = vehiculos.velocidad;
            // Put this updated object back into the database
            var updateRequest = objectStore.put(data);

            updateRequest.onsuccess = function (event) {
                console.log("Datos actualizados con éxito");
                alert("Datos registrados correctamente")
            };

            updateRequest.onerror = function (event) {
                console.log("Error al actualizar los datos");
                console.log("Error al actualizar los datos", event.target.error);
            };
        };

        getRequest.onerror = function (event) {
            console.log("Error al obtener los datos");
        };
    };

    request.onerror = function (event) {
        console.log("Error al abrir la base de datos");
    };
}
const indexNav = document.getElementById('index');
const agregarNav = document.getElementById('agregar');
const conductor = document.getElementById('conductor');

function estadoDB() {
    let transaction = db.transaction(["usuarios"], "readonly");
    let objectStore = transaction.objectStore("usuarios");
    let countRequest = objectStore.count();
    return new Promise((resolve) => {
        countRequest.onsuccess = function () {
            resolve(countRequest.result)
        };
    })
}


function activarNav() {//MARCAR EN QUE PAGINA ESTOY
    let dbvacia;
    //LA FUNCION DE LA DB SE TOMA SU TIEMPO PORQUE REALIZA OPERACIONES ASINCRONAS, POR LO TANTO SI QUIERO
    //OBTENER DATOS DE DICHA FUNCION DEBO ESPERAR A QUE REALICE LOS PROCESO, PARA ELLO SE USAN
    //LAS PROMESAS, ESTAS PERMITEN EJECUTAR UNA RUTINA DESPUES DE QUE SE OBTENGA EL RESULTADO
    estadoDB().then(resultado => {
        console.log(resultado);
        dbvacia = resultado;
        console.log(dbvacia);
        if (indexNav != null) {
            document.getElementById("activoIndex").classList.add('active');
        }
        else if (consultar != null) {
            document.getElementById("activoConsultar").classList.add('active');
        }
        else if (conductor != null) {
            document.getElementById("activoConsultar").classList.add('active');
            if (!dbvacia) {
                document.getElementById('guardar').disabled = true;
                document.getElementById('label1').innerHTML = "*NO EXISTEN VEHICULOS REGISTRADOS*"
                document.getElementById("label1").style.color = "red"
            }
            else {
                document.getElementById('guardar').disabled = false;
                document.getElementById('label1').innerHTML = ""

            }
        }
        else if (eliminarStado != null) {
            document.getElementById("activoEliminar").classList.add('active');
            if (!dbvacia) {
                document.getElementById("msjEliminar").innerHTML = "*NO EXISTEN VEHICULOS REGISTRADOS*"
                document.getElementById("msjEliminar").style.color = "red"
            }
            else {
                document.getElementById("msjEliminar").innerHTML = "Selecciona el vehículo que quieres eliminar. Para estar seguro de tu elección oprime el icono de detalles y obtendras todos los datos del vehículo"
                document.getElementById("msjEliminar").style.color = "black"
            }
        }
        else if (agregarNav != null) {
            document.getElementById("activoAgregar").classList.add('active');
        }

    })
}
//ESPERO A QUE SE ABRA CORRECTAMENTE LA PAGINA 
setTimeout(function () { activarNav() }, 200);

