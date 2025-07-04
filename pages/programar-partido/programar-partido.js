let ligas = [];
let canchas = [];
let lstEquipos = [];
let partidoId = null;
let ligaSeleccionada = null;

function agregarLigaATabla(liga) {
    const option = `<option value="${liga.id}">${liga.nombre_liga}</option>`;
    $('#liga-select').append(option);
}

function agregarCanchaTabla(cancha) {
    const option = `<option value="${cancha.id}">${cancha.nombre}</option>`;
    $('#cancha-select').append(option);
}

function agregarJornadas(limite_equipos) {
    for (let index = 1; index <limite_equipos; index++) {  
        const option = `<option value="${index}"> Jornada ${index}</option>`;
        $('#jornada-select').append(option);
    }
}

function obtenerDatos() {
    $.ajax({
        url: 'programar-partidos.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                ligas = response.ligas;
                canchas = response.canchas;
                $('#liga-select').empty();
                $('#cancha-select').empty();
                $('#liga-select').append('<option value="">Seleccionar liga</option>');
                $('#cancha-select').append('<option value="">Seleccionar cancha</option>');
                ligas.forEach(liga => {
                    agregarLigaATabla(liga);
                });
                canchas.forEach(cancha => {
                    agregarCanchaTabla(cancha);
                });
            } else {
                alert("Error al cargar datos: " + response.error);
            }
        },
        error: function() {
            alert("Error al conectarse con el servidor.");
        }
    });
}

async function obtenerEquiposPorLiga(ligaId) {
    $('#jornada-select').empty().append('<option value="">-- Seleccionar Jornada --</option>');
    let ligaSelect = ligas.find(liga => liga.id == ligaId);
    try {
        const response = await $.ajax({
            url: 'programar-partidos.php',
            type: 'GET',
            data: { liga_id: ligaId },
            dataType: 'json'
        });

        if (response.success) {
            lstEquipos = response.equipos;
            agregarJornadas(ligaSelect.limite_equipos); // Agregar jornadas con límite de equipos
            const options = lstEquipos.map(equipo =>
                `<option value="${equipo.id}">${equipo.nombre_equipo}</option>`
            ).join('');
            $('#equipoLocal').empty().append('<option value="">-- Seleccionar Equipo --</option>' + options);
            $('#equipoVisitante').empty().append('<option value="">-- Seleccionar Equipo --</option>' + options);
        } else {
            alert("Error al cargar equipos: " + response.error);
        }
    } catch (error) {
        alert("Error al conectarse con el servidor.");
    }
}


async function obtenerDatosPartido(idPartido) {
    try {
        const response = await $.ajax({
            url: 'programar-partidos.php', // Cambia según tu endpoint
            type: 'GET',
            data: { id_partido: idPartido },
            dataType: 'json'
        });

        if (response.success && response.partido) {
            const partido = response.partido;
            $('#liga-select').val(partido.liga_id);

            // Esperar a que se carguen los equipos y jornadas antes de proceder
            await obtenerEquiposPorLiga(partido.liga_id);

            // Ahora que los equipos y las jornadas están cargados, seleccionamos los valores del partido
            $('#jornada-select').val(partido.jornada);
            $('#equipoLocal').val(partido.equipo_local_id);
            $('#equipoVisitante').val(partido.equipo_visitante_id);
            $('#fecha').val(partido.fecha);
            $('#hora').val(partido.hora);
            $('#cancha-select').val(partido.cancha_id);
        } else {
            alert('No se pudo cargar el partido para editar.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
}




$(document).ready(function() {
    obtenerDatos();

    const urlParams = new URLSearchParams(window.location.search);
    partidoId = urlParams.get('id_partido');

    if (partidoId) {
        obtenerDatosPartido(partidoId);
    }

 

    const fechaInput = document.getElementById("fecha");
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", hoy);

    const horaInput = document.getElementById("hora");
    horaInput.addEventListener("input", () => {
        const [hours, minutes] = horaInput.value.split(":");
        if (minutes !== "00") {
            horaInput.value = `${hours.padStart(2, '0')}:00`;
        }
    });

    $('#liga-select').on('change', function() {
        ligaSeleccionada = $(this).val();
        if (ligaSeleccionada) {
            obtenerEquiposPorLiga(ligaSeleccionada); 
        } else {
            limpiarSelectEquipos();
        }
    });
     


    $('form').on('submit', function(e) {
        e.preventDefault();
        let accion = "crear";
        if (partidoId) {
            accion = "actualizar";
        }

        const liga_id = $('#liga-select').val();
        const jornada = $('#jornada-select').val();
        const equipo_local_id = $('#equipoLocal').val();
        const equipo_visitante_id = $('#equipoVisitante').val();
        const fecha = $('#fecha').val();
        const hora = $('#hora').val();
        const cancha_id = $('#cancha-select').val();

        if (!liga_id || !jornada || !equipo_local_id || !equipo_visitante_id || !fecha || !hora || !cancha_id) {
            alert("Todos los campos son obligatorios");
            return;
        }

        $.ajax({
            url: 'programar-partidos.php',
            type: 'POST',
            data: {
                accion,
                partidoId, 
                liga_id,
                jornada,
                equipo_local_id,
                equipo_visitante_id,
                fecha,
                hora,
                cancha_id
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert(response.message);
                    limpiarFormulario(); 
                } else {
                    alert("Error: " + response.error);
                }
            },
            error: function() {
                alert("Error al conectarse con el servidor.");
            }
        });
    });

    function limpiarSelectEquipos() {
        $('#equipoLocal').empty().append('<option value="">-- Seleccionar Equipo --</option>');
        $('#equipoVisitante').empty().append('<option value="">-- Seleccionar Equipo --</option>');
        $('#jornada-select').empty().append('<option value="">-- Seleccionar la jornada --</option>');
    }

    function limpiarFormulario() {
        $('form')[0].reset()
        limpiarSelectEquipos();
        $('#liga-select').val(''); 
        $('#cancha-select').val(''); 
        $('#fecha').val(''); 
        $('#hora').val('');  
        ligaSeleccionada = null;
    }
});


