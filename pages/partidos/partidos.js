let partidosData = [];

// Función para obtener los partidos desde un backend o archivo
function obtenerPartidos() {
    $.ajax({
        url: 'partidos.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                partidosData = response.partidos;
                llenarFiltros(partidosData);
                mostrarPartidos(partidosData);
            } else {
                alert("Error al obtener los partidos: " + response.error);
            }
        },
        error: function () {
            alert("Error al conectarse con el servidor.");
        },
    });
}
const estadosMap = {
    0: "Pendiente",
    1: "Jugado"
};
function llenarFiltros(partidos) {
    const ligasSelect = $('#select-liga');
    const jornadasSelect = $('#select-jornada');
    const estadoPartidoSelect = $('#select-estadoPartido');

    ligasSelect.empty().append('<option value="">Seleccionar Liga</option>');
    jornadasSelect.empty().append('<option value="">Seleccionar Jornada</option>');
    estadoPartidoSelect.empty().append('<option value="">Seleccionar Estado</option>');

    const ligasUnicas = [...new Set(partidos.map(partido => partido.liga))];
    const jornadasUnicas = [...new Set(partidos.map(partido => partido.jornada))];
    const estadosUnicos = [...new Set(partidos.map(partido => partido.estado))];
    ligasUnicas.forEach(liga => {
        ligasSelect.append(`<option value="${liga}">${liga}</option>`);
    });

    jornadasUnicas.forEach(jornada => {
        jornadasSelect.append(`<option value="${jornada}">Jornada ${jornada}</option>`);
    });
    estadosUnicos.forEach(estado => {
        const nombreEstado = estadosMap[estado] || "Desconocido";
        estadoPartidoSelect.append(`<option value="${estado}">${nombreEstado}</option>`);
    });
}



// Mostrar las tarjetas de partidos
function mostrarPartidos(partidos) {
    const contenedorPartidos = $('#partidos-lista');
    contenedorPartidos.empty();

    if (partidos.length === 0) {
        contenedorPartidos.append('<p class="text-center w-100">No hay partidos programados.</p>');
        return;
    }

    partidos.forEach(partido => {
        const estado = partido.estado == 1 ? 'Jugado' : 'Pendiente';
        const resultado = partido.estado == 1
            ? `${partido.gol_local} - ${partido.gol_visita}`
            : 'vs'; // Cambio el resultado a "vs" si el partido está pendiente

        // Agregar clases o deshabilitar botones si el partido ya se jugó
        const deshabilitarEventos = estado === 'Jugado' ? 'pointer-events: none; color: #ccc;' : ''; 

        const tarjeta = `
            <div class="card">
                <div class="row">
                    <div class="col-12">
                        <div class="partido ${estado === 'Jugado' ? 'jugado' : 'pendiente'}">
                            <div class="info-partido">
                                <p class="detalles"><strong>Liga:</strong> ${partido.liga} <strong>Jornada:</strong> ${partido.jornada}</p>
                            </div>
                            <div class="row">
                                <div class="col-3">
                                    <div class="info-partido equipo-local">
                                        <p>${partido.equipo_local}</p>
                                        <div class="equipo-logo">
                                            <img src="data:image/jpeg;base64,${partido.logo_local}" alt="${partido.equipo_local}">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-5">
                                    <div class="info-partido resultado">
                                        <p class="titulo"><strong>${resultado}</strong></p>
                                        <p class="detalles">Fecha: ${partido.fecha} | Hora: ${partido.hora}</p>
                                        <p class="detalles">Cancha: ${partido.cancha}</p>
                                        <p class="detalles">Estado: <strong>${estado}</strong></p>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="info-partido equipo-visitante">
                                        <p>${partido.equipo_visitante}</p>
                                        <div class="equipo-logo">
                                            <img src="data:image/jpeg;base64,${partido.logo_visita}" alt="${partido.equipo_visitante}">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-1">
                                    <div class="botones">
                                    <a href="../programar-partido/programar-partido.html?id_partido=${partido.id}" class="btn-ver-eventos" style="${deshabilitarEventos}">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                        <a href="../detalles-partidos/detalles-partidos.html?id_partido=${partido.id}&equipo_local_id=${partido.equipo_local_id}&equipo_visitante_id=${partido.equipo_visitante_id}" class="btn-ver-eventos" style="${deshabilitarEventos}">
                                            <i class="fas fa-futbol""></i>
                                        </a>
                                        <a href="../info-partido/info-partido.html?id_partido=${partido.id}&equipo_local_id=${partido.equipo_local_id}&equipo_visitante_id=${partido.equipo_visitante_id}"
                                        <i class="fas fa-eye"></i>
                                         </a>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        contenedorPartidos.append(tarjeta);
    });
}

// 

// Filtros de búsqueda
function filtrarPartidos() {
    const ligaSeleccionada = $('#select-liga').val();
    const jornadaSeleccionada = $('#select-jornada').val();
    const estadoPartidoSeleccionado = $('#select-estadoPartido').val();
    

    const partidosFiltrados = partidosData.filter(partido => {
        return (
            (ligaSeleccionada === '' || partido.liga === ligaSeleccionada) &&
            (jornadaSeleccionada === '' || partido.jornada == jornadaSeleccionada) &&
            (estadoPartidoSeleccionado=== '' || partido.estado == estadoPartidoSeleccionado)
        );
    });
    mostrarPartidos(partidosFiltrados);
}

// Cargar al iniciar
$(document).ready(function () {
    obtenerPartidos();
});
