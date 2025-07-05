let ligas = [];
let jugadores = [];
let lstEquipos = [];
let ligaSeleccionada = null;
let equipoSeleccionado = null;

function agregarLigaATabla(liga) {
    const option = `
        <option value="${liga.id}">
            ${liga.nombre_liga} - ${liga.limite_equipos} equipos
        </option>`;
    $('#liga-select').append(option);
}

function agregarEquipoATabla(equipo) {
    const row = `
        <tr data-id="${equipo.id}">
            <td><img src="data:image/jpeg;base64,${equipo.logo}" width="50"></td>
            <td>${equipo.nombre_equipo}</td>
        </tr>`;
    $('#equipos-lista').append(row);
}

function agregarJugadorATabla(jugador) {
    const row = `
        <tr data-id="${jugador.id}">
            <td><img src="data:image/jpeg;base64,${jugador.foto}" width="50"></td>
            <td>${jugador.nombre} ${jugador.apellido}</td>
            <td>
            <button class="btn btn-warning btn-sm btn-agregar-jugador" data-id="${jugador.id}">
                <i class="fas fa-plus"></i>
            </button>
            </td>
        </tr>`;
    $('#jugadores-lista').append(row);
}

function obtenerDatos() {
    $.ajax({
        url: 'jugadores-equipo.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                ligas = response.ligas;
                jugadores = response.jugadores;
                $('#liga-select').empty();
                $('#liga-select').append('<option value="">Seleccionar liga</option>');
                $('#equipos-lista').empty();
                $('#jugadores-lista').empty();
                response.ligas.forEach(liga => agregarLigaATabla(liga));
                response.jugadores.forEach(jugador => agregarJugadorATabla(jugador));
            } else {
                alert("Error al cargar datos: " + response.error);
            }
        }
    });
}

function obtenerEquiposPorLiga(ligaId) {
    $.ajax({
        url: 'jugadores-equipo.php',
        type: 'GET',
        data: { liga_id: ligaId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                $('#equipos-lista').empty();
                lstEquipos = [];
                response.equipos.forEach(equipo => {
                    lstEquipos.push(equipo);
                    agregarEquipoATabla(equipo);
                });
            } else {
                alert("Error al cargar equipos: " + response.error);
            }
        }
    });
}

function agregarJugadorAlEquipo(jugadorId) {
    if (!equipoSeleccionado) {
        alert("Selecciona un equipo primero.");
        return;
    }
    
    $.ajax({
        url: 'jugadores-equipo.php',
        type: 'POST',
        data: {
            action: 'inserta_jugador',
            equipo_id: equipoSeleccionado,
            jugador_id: jugadorId,
            liga_id: ligaSeleccionada
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                alert("Jugador agregado correctamente");
                actualizarJugadoresAgregados();
            } else {
                alert("Error al agregar jugador: " + response.error);
            }
        }
    });
}

function actualizarJugadoresAgregados() {
    $('#jugadores-agregados').empty();
    $.ajax({
        url: 'jugadores-equipo.php',
        type: 'POST',
        data: { action: 'get_jugadores_agregados', liga_id: ligaSeleccionada, equipo_id: equipoSeleccionado },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                if (response.jugadores.length === 0) {
                    $('#jugadores-agregados').append('<tr><td colspan="3">No hay jugadores agregados</td></tr>');
                } else {
                    response.jugadores.forEach(jugador => {
                        const row = `
                            <tr data-id="${jugador.id}">
                                <td><img src="data:image/jpeg;base64,${jugador.foto}" width="50"></td>
                                <td>${jugador.nombre} ${jugador.apellido}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger btn-eliminar" onclick="eliminarJugador(${jugador.id})">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>`;
                        $('#jugadores-agregados').append(row);
                    });
                }
            } else {
                alert("Error al cargar jugadores agregados: " + response.error);
            }
        }
    });
}
function eliminarJugador(jugadorId) {
    $.ajax({
        url: 'jugadores-equipo.php',
        type: 'POST',
        data: {
            action: 'eliminar_jugador',
            equipo_id: equipoSeleccionado,
            jugador_id: jugadorId,
            liga_id: ligaSeleccionada
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                alert("Jugador eliminado correctamente");
                actualizarJugadoresAgregados();
            } else {
                alert("Error al eliminar jugador: " + response.error);
            }
        }
    });
}
$(document).ready(function() {
    obtenerDatos();

    $('#liga-select').on('change', function() {
        ligaSeleccionada = $(this).val();
        equipoSeleccionado = null;
        obtenerEquiposPorLiga(ligaSeleccionada);
        $('#jugadores-agregados').empty(); 
    });

    $(document).on('click', '#equipos-lista tr', function () { 
        $('#equipos-lista tr').removeClass('table-active');
        $(this).addClass('table-active');
        equipoSeleccionado = $(this).data('id');
        actualizarJugadoresAgregados();
    });

    $(document).on('click', '.btn-agregar-jugador', function() {
        if (!equipoSeleccionado) {
            alert("Selecciona un equipo primero.");
            return;
        }
        const jugadorId = $(this).data('id');
        agregarJugadorAlEquipo(jugadorId);
    });
});
