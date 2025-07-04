let partidoId = null;

function agregarDatosATabla(evento) {
    const row = `
    <tr data-id="${evento.id}">
        <td>${evento.nombre_equipo}</td>
        <td>${evento.nombre_jugador}</td>
        <td>${evento.evento}</td>
    </tr>
    `;
    $('#tablaResultados').append(row);
}


$(document).ready(function () {

    const urlParams = new URLSearchParams(window.location.search);
    partidoId = urlParams.get('id_partido');
    if (partidoId) {
        $.ajax({
            url: 'info-partido.php',
            type: 'GET',
            data: { partidoId: partidoId },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                   
                    const partido = response.partido;
                    const eventos = response.eventos;

                    if (partido.logo_local) {
                        $('#logo-local').attr('src', `data:image/jpeg;base64,${partido.logo_local}`);
                        $('#nombre-local').text(partido.equipo_local);
                    }
                    if (partido.logo_visitante) {
                        $('#logo-visitante').attr('src', `data:image/jpeg;base64,${partido.logo_visitante}`);
                        $('#nombre-visitante').text(partido.equipo_visitante);
                    }

                    $('#score').text(partido.gol_local+" - "+partido.gol_visita);

                    $('#tablaResultados').empty();
                   eventos.forEach(evento => agregarDatosATabla(evento));
                   

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
});

