let ligas = [];
let lstEquipos = [];
let ligaSeleccionada = null;

function agregarLigaATabla(liga) {
    const option = `<option value="${liga.id}">${liga.nombre_liga}</option>`;
    $('#liga-select').append(option);
}

function limpiarSelectEquipos() {
    $('#equipos').empty().append('<option value="">-- Seleccionar Equipo --</option>');
}

function obtenerDatos() {
    $.ajax({
        url: 'liga-estadisticas.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                ligas = response.ligas;
                $('#liga-select').empty();
                $('#liga-select').append('<option value="">Seleccionar liga</option>');
                ligas.forEach(liga => {
                    agregarLigaATabla(liga);
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

function obtenerEquiposPorLiga(ligaId) {
    $.ajax({
        url: 'liga-estadisticas.php',
        type: 'GET',
        data: { liga_id: ligaId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                lstEquipos = response.equipos;
                const options = lstEquipos.map(equipo =>
                    `<option value="${equipo.id}">${equipo.nombre_equipo}</option>`
                ).join('');
                $('#equipos').empty().append('<option value="">-- Seleccionar Equipo --</option>' + options);
            } else {
                alert("Error al cargar equipos: " + response.error);
            }
        },
        error: function() {
            alert("Error al conectarse con el servidor.");
        }
    });
}

function obtenerGoleadores(ligaId, eventoId, equipoId = null) {
    const data = { accion: 'goleadores', liga_id: ligaId, evento_id: eventoId }; 
    if (equipoId) {
        data.equipo_id = equipoId;
    }

    $.ajax({
        url: 'liga-estadisticas.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const goleadores = response.goleadores;
                const tbody = $('#Goleadores');
                tbody.empty();

                if (goleadores.length === 0) {
                    tbody.append('<tr><td colspan="3">No hay datos disponibles</td></tr>');
                    $('#tabla-goleadores').show();
                    return;
                }
                goleadores.forEach(goleador => {
                    const row = `
                        <tr>
                            <td>${goleador.nombre}</td>
                            <td>${goleador.nombre_equipo}</td>
                            <td>${goleador.goles}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });

                $('#tabla-goleadores').show();
            } else {
                alert("No se encontraron goleadores: " + response.error);
            }
        },
        error: function() {
            alert("Error al conectarse con el servidor.");
        }
    });
}
function obtenerTarjetas(ligaId, eventoId, equipoId = null) {
    const tbodyId = eventoId === 2 ? '#tarjetas-amarilla' : '#tarjetas-rojas';
    $.ajax({
        url: 'liga-estadisticas.php',
        type: 'GET',
        data: { accion: 'tarjetas', liga_id: ligaId, evento_id: eventoId, equipo_id: equipoId },
        dataType: 'json',
        success: function(response) {
            const tbody = $(tbodyId);
            tbody.empty();
            if (response.success) {
                response.tarjetas.forEach(tarjeta => {
                    tbody.append(`
                        <tr>
                            <td>${tarjeta.nombre}</td>
                            <td>${tarjeta.nombre_equipo}</td>
                            <td>${tarjeta.tarjetas}</td>
                        </tr>
                    `);
                });
            } else {
                tbody.append('<tr><td colspan="3">No hay datos disponibles</td></tr>');
            }
            $('#tabla-tarjetas').show();
            $('#tabla-goleadores').hide();
        }
    });
}

function obtenerEquiposPorGolesRecibidos(ligaId) {
    $.ajax({
        url: 'liga-estadisticas.php',
        type: 'GET',
        data: { accion: 'equipos_goles_recibidos', liga_id: ligaId },
        dataType: 'json',
        success: function(response) {
            const tbody = $('#Portero-menos-vencido');
            tbody.empty();

            if (response.success) {
                const equipos = response.equipos;

                if (equipos.length === 0) {
                    tbody.append('<tr><td colspan="3">No hay datos disponibles</td></tr>');
                } else {
                    equipos.forEach(equipo => {
                        tbody.append(`
                            <tr>
                                <td>${equipo.nombre}</td>
                                <td>${equipo.goles_recibidos}</td>
                            </tr>
                        `);
                    });
                }

                $('#tabla-porteros').show();
            } else {
                alert("Error al obtener datos: " + response.error);
            }
        },
        error: function() {
            alert("Error al conectarse con el servidor.");
        }
    });
}

$(document).ready(function() {
    obtenerDatos();

    $('#liga-select').on('change', function() {
        ligaSeleccionada = $(this).val();
        limpiarSelectEquipos();
        if (ligaSeleccionada) {
            obtenerEquiposPorLiga(ligaSeleccionada);
        }
    });

    $('#btn-goleadores').on('click', function() {
        if (ligaSeleccionada) {
            const equipoSeleccionado = $('#equipos').val();
            obtenerGoleadores(ligaSeleccionada,1, equipoSeleccionado);
        } else {
            alert("Por favor, selecciona una liga primero.");
        }
    });
    $('#btn-tarjetas').on('click', function() {
        if (ligaSeleccionada) {
            obtenerTarjetas(ligaSeleccionada, 2, $('#equipos').val()); 
            obtenerTarjetas(ligaSeleccionada, 3, $('#equipos').val()); 
        } else {
            alert("Por favor, selecciona una liga primero.");
        }
    });
    $('#btn-porteros').on('click', function() {
        if (ligaSeleccionada) {
            obtenerEquiposPorGolesRecibidos(ligaSeleccionada);
        } else {
            alert("Por favor, selecciona una liga primero.");
        }
    });
});
