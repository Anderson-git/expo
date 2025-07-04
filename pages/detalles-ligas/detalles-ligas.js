let ligas = [];
let ligaSeleccionada = null;


const urlParams = new URLSearchParams(window.location.search);
const ligaId = urlParams.get('id');

function mostrarLiga(liga) {
    const row = `
    <tr>
        <td><img src="data:image/jpeg;base64,${liga.logo}" width="50"></td>
        <td>${liga.nombre_liga}</td>
        <td>${liga.limite_equipos}</td>
        <td>${liga.equipos_inscritos ?? "0"}</td>
        <td>${liga.cuota_por_equipo}</td>
        <td>${liga.cupo_disponible ?? "disponibles"}</td>
    </tr>`;
    $('#ligas-lista').append(row);
}

function obtenerLigaSeleccionada() {
    $.ajax({
        url: 'detalles-ligas.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                ligaSeleccionada = response.ligas.find(liga => liga.id == ligaId);
                if (ligaSeleccionada) {
                    mostrarLiga(ligaSeleccionada);
                } else {
                    alert("Liga no encontrada.");
                }
            } else {
                alert("Error al cargar ligas: " + response.error);
            }
        }
    });
}

function actualizarEquiposAgregados() {
    $('#equipos-agregados').empty();

    $.ajax({
        url: 'detalles-ligas.php',
        type: 'POST',
        data: { 
            action: 'get_equipos_agregados', 
            liga_id: ligaId 
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                response.equipos.forEach(equipo => {
                    const row = `
                        <tr data-id="${equipo.id}">
                            <td><img src="data:image/jpeg;base64,${equipo.logo}" width="50"></td>
                            <td>${equipo.nombre_equipo}</td>
                        </tr>`;
                    $('#equipos-agregados').append(row);
                });
            } else {
                alert("Error al cargar equipos agregados: " + response.error);
            }
        },
        error: function () {
            alert("Ocurrió un error al cargar los equipos.");
        }
    });
}

$(document).ready(function () {
    obtenerLigaSeleccionada();
    actualizarEquiposAgregados();
});
