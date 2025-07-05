let ligas = [];
let lstEquipos = [];
let ligaSeleccionada = null;

function agregarLigaATabla(liga) {
    const row = `
    <tr data-id="${liga.id}">
        <td><img src="data:image/jpeg;base64,${liga.logo}" width="50"></td>
        <td>${liga.nombre_liga}</td>
        <td>${liga.limite_equipos}</td>
    </tr>`;
    $('#ligas-lista').append(row);
}

function agregarEquipoATabla(equipo) {
    const row = `
    <tr data-id="${equipo.id}">
        <td><img src="data:image/jpeg;base64,${equipo.logo}" width="50"></td>
        <td>${equipo.nombre_equipo}</td>
        <td>
            <button class="btn btn-warning btn-sm btn-agregar-equipo">
                <i class="fas fa-plus"></i>
            </button>
        </td>
    </tr>`;
    $('#equipos-lista').append(row);
}

function obtenerDatos() {
    $.ajax({
        url: 'liga-equipo.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                ligas = response.ligas;
                lstEquipos = response.equipos;
                $('#ligas-lista').empty();
                $('#equipos-lista').empty();
                lstEquipos.forEach(equipo => agregarEquipoATabla(equipo));
                response.ligas.forEach(liga => agregarLigaATabla(liga));
            } else {
                alert("Error al cargar ligas: " + response.error);
            }
        }
    });
}


function actualizarEquiposAgregados() {
    $('#equipos-agregados').empty();

    $.ajax({
        url: 'liga-equipo.php',
        type: 'POST',
        data: { action: 'get_equipos_agregados', liga_id: ligaSeleccionada },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                $('#liga-seleccionada-titulo').text("Liga Seleccionada: " + response.liga_nombre);
                response.equipos.forEach(equipo => {
                    const row = `
                        <tr data-id="${equipo.id}">
                            <td><img src="data:image/jpeg;base64,${equipo.logo}" width="50"></td>
                            <td>${equipo.nombre_equipo}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-eliminar"   onclick="eliminarEquipoLiga(${equipo.id},${ligaSeleccionada})">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`;
                    $('#equipos-agregados').append(row);
                });
            } else {
                alert("Error al cargar equipos agregados: " + response.error);
            }
        }
    });
}
function eliminarEquipoLiga(idEquipo, idLiga) {

    if (confirm("¿Estás seguro de eliminar el equipo?")) {
        let data = { action: "eliminar", equipo_id: idEquipo, liga_id: idLiga };
        $.ajax({
            url: 'liga-equipo.php',
            type: 'POST',
            data: data,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    alert("Equipo eliminado exitosamente");
                    actualizarEquiposAgregados() 
                } else {
                    alert("Error al eliminar equipo: " + response.error);
                }
            },
            error: function(error){
            }
        });
    }
}


$(document).ready(function () {
    obtenerDatos();

    $(document).on('click', '#ligas-lista tr', function () {
        $('#ligas-lista tr').removeClass('table-active');
        $(this).addClass('table-active');
        ligaSeleccionada = $(this).data('id');
        actualizarEquiposAgregados();
    });

    $(document).on('click', '.btn-agregar-equipo', function () {
        const equipoId = $(this).closest('tr').data('id');

        if (!ligaSeleccionada) {
            alert("Por favor selecciona una liga primero.");
            return;
        }

        $.ajax({
            url: 'liga-equipo.php',
            type: 'POST',
            data: {action:"inserta",  equipo_id: equipoId, liga_id: ligaSeleccionada },
            success: function (response) {
                if (response.success) {
                    alert("Equipo agregado exitosamente a la liga.");
                    actualizarEquiposAgregados();
                } else {
                    alert("Error al agregar equipo: " + response.error);
                }
            }
        });
    });
});



