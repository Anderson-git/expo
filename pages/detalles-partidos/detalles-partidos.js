let marcador = { partidoId: null, equipo_localId: null, golLocal: 0, equipo_visitanteId: null, golVisita: 0 };
let eventos = [];
let partidoId = null;

function mostrarModalConfirmacion() {
    $('#modalConfirmacion').modal('show');
}

function agregarAccion() {
    const equipoId = $('#equipo-select').val();
    const jugadorId = $('#jugador').val();
    const eventoId = $('#accion').val();
    const accionNombre = $('#accion option:selected').text();

    if (!equipoId || !jugadorId || !eventoId) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const equipo = $('#equipo-select option:selected').text();
    const jugador = $('#jugador option:selected').text();

    if (accionNombre === "Gol") {
        if (equipoId == marcador.equipo_localId) {
            marcador.golLocal++;
        } else if (equipoId == marcador.equipo_visitanteId) {
            marcador.golVisita++;
        }
        actualizarMarcador();
    }

    let evento = { partidoId, equipoId, jugadorId, eventoId, accionNombre };
    eventos.push(evento);

 
    const tablaResultados = $('#tablaResultados');
    const nuevaFila = $('<tr></tr>');
    nuevaFila.append(`<td>${equipo}</td>`);
    nuevaFila.append(`<td>${jugador}</td>`);
    nuevaFila.append(`<td>${accionNombre}</td>`);
    nuevaFila.append(
        `<td><button class="btn btn-danger btn-sm" onclick="eliminarAccion(this, ${eventos.length - 1})"><i class="fas fa-trash-alt"></i></button></td>`
    );
    tablaResultados.append(nuevaFila);
}

function eliminarAccion(boton, index) {
    const eventoEliminado = eventos[index];
    $(boton).closest('tr').remove();
    eventos.splice(index, 1);
    if (eventoEliminado.accionNombre === "Gol") {
        if (eventoEliminado.equipoId == marcador.equipo_localId) {
            marcador.golLocal--;
        } else if (eventoEliminado.equipoId == marcador.equipo_visitanteId) {
            marcador.golVisita--;
        }
        actualizarMarcador();
    }
}

function actualizarMarcador() {
    $('#score').text(`${marcador.golLocal} - ${marcador.golVisita}`);
}

function guardarEventos() {
    console.log(eventos);
    console.log(marcador);

    let formData = {
        eventos: eventos,
        marcador: marcador
    };

    $.ajax({
        url: 'detalles-partidos.php',
        type: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                $('#modalConfirmacion').modal('hide');
                $('#tablaResultados').empty();
                bloquearFormulario();

                alert("Operación exitosa");
            } else {
                alert("Error: " + response.error);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error en la solicitud AJAX:", error);
            alert("Error al guardar los datos.");
        }
    });
}

function bloquearFormulario() {
    $('#equipo-select').prop('disabled', true);
    $('#jugador').prop('disabled', true);
    $('#accion').prop('disabled', true);
    $('button[onclick="agregarAccion()"]').prop('disabled', true);
    $('#btnConfirmarGuardar').prop('disabled', true);
    $('.form-control, button').addClass('disabled');
}


$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    partidoId = urlParams.get('id_partido');
    marcador.partidoId = partidoId;
    eventos =[];
    if (partidoId) {
        $.ajax({
            url: 'detalles-partidos.php',
            type: 'GET',
            data: { partidoId: partidoId },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const partido = response.partido;
                    marcador.equipo_localId = partido.equipo_local_id;
                    marcador.equipo_visitanteId = partido.equipo_visitante_id;
                    const equipos = response.equipos;
                    if (partido.logo_local) {
                        $('#logo-local').attr('src', `data:image/jpeg;base64,${partido.logo_local}`);
                        $('#nombre-local').text(partido.equipo_local);
                    }
                    if (partido.logo_visitante) {
                        $('#logo-visitante').attr('src', `data:image/jpeg;base64,${partido.logo_visitante}`);
                        $('#nombre-visitante').text(partido.equipo_visitante);
                    }

                    $('#equipo-select').empty().append('<option value="">-- Selecciona equipo --</option>');
                    equipos.forEach(equipo => {
                        $('#equipo-select').append(
                            `<option value="${equipo.id}">${equipo.nombre}</option>`
                        );
                    });
                } else {
                    alert(response.error || 'Error al cargar los detalles del partido.');
                }
            },
            error: function () {
                alert('Error al conectarse con el servidor.');
            }
        });
    } else {
        alert('ID de partido no especificado en la URL.');
    }

    $('#equipo-select').on('change', function () {
        const equipoId = $(this).val();

        if (equipoId) {
            $.ajax({
                url: 'detalles-partidos.php',
                type: 'GET',
                data: { equipo_id: equipoId },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        const jugadores = response.jugadores;

                        $('#jugador').empty().append('<option value="">-- Selecciona jugador --</option>');
                        jugadores.forEach(jugador => {
                            $('#jugador').append(
                                `<option value="${jugador.id}">${jugador.nombre}</option>`
                            );
                        });
                    } else {
                        alert(response.error || 'Error al cargar los jugadores del equipo.');
                    }
                },
                error: function () {
                    alert('Error al conectarse con el servidor.');
                }
            });
        } else {
            $('#jugador').empty().append('<option value="">-- Selecciona jugador --</option>');
        }
    });
    $.ajax({
        url: 'detalles-partidos.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const eventos = response.eventos;
                const accionSelect = $('#accion');
                accionSelect.empty().append('<option value="">-- Selecciona acción --</option>');

                eventos.forEach(evento => {
                    accionSelect.append(
                        `<option value="${evento.id}">${evento.nombre}</option>`
                    );
                });
            } else {
                alert(response.error || 'Error al cargar las acciones.');
            }
        },
        error: function () {
            alert('Error al conectarse con el servidor.');
        }
    });
});

