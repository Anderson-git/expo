let ligas = [];

let ligasFiltradas = [];

function mostrarModalCrearLiga() {
    $('#nombre-liga').val('');
    $('#encargado-liga').val('');
    $('#telefono-encargado-liga').val('');
    $('#limites-equipos').val('');
    $('#cuota-equipo').val('');
    $('#limite-jugadores').val('');
    $('#logo-liga').val('');
    $('#crearLigaBtn').text('Guardar');
    $('#accion').val('crear');
    $('#modallogo').attr('src', '../../assets/img/logoFut.png').show();
    $('#modalCrearLiga').modal('show');
}
function updateLiga(idLiga) {
    const liga = ligas.find(j => j.id === idLiga);
    if (liga) {
        $('#liga_id').val(liga.id);
        $('#nombre-liga').val(liga.nombre_liga);
        $('#encargado-liga').val(liga.nombre_encargado);
        $('#telefono-encargado-liga').val(liga.telefono_encargado);
        $('#limites-equipos').val(liga.limite_equipos);
        $('#cuota-equipo').val(liga.cuota_por_equipo);
        $('#limite-jugadores').val(liga.limite_jugadores);
        
        if (liga.logo) {
            $('#modallogo').attr('src', `data:image/jpeg;base64,${liga.logo}`).css('display', 'block');
        } else {
            $('#modallogo').hide();
        }

        $('#crearLigaBtn').text("Actualizar");
        $('#accion').val('actualizar');
        $('#modalCrearLiga').modal('show');
    } else {
        console.error('Liga no encontrada');
    }
}

// Vista previa de la imagen seleccionada
$('#logo-liga').on('change', function (event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $('#modallogo').attr('src', e.target.result).css('display', 'block');
    };
    reader.readAsDataURL(event.target.files[0]);
});
function agregarLigaATabla(liga) {
    const row = `
    <tr data-id="${liga.id}">
        <td><img src="data:image/jpeg;base64,${liga.logo}" width="50"></td>
        <td>${liga.nombre_liga}</td>
        <td>${liga.limite_equipos}</td>
        <td>${"0"}</td>
        <td>${liga.cuota_por_equipo}</td>
        <td>${"disponibles"}</td>
        <td>
            <button id="btn-actualizar-${liga.id}" class="btn btn-sm btn-warning btn-edit"  onclick="updateLiga(${liga.id});"> 
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar">
                <i class="fas fa-trash-alt"></i>
            </button>
            <a href="../detalles-ligas/detalles-ligas.html?id=${liga.id}">
                <button class="btn btn-sm btn-info-custom btn-detalles">
                    <i class="fas fa-info-circle"></i>
                </button>
            </a>
            </a>
        </td>
    </tr>
    `;
    $('#ligas-lista').append(row);
}
function obtenerDatosLigas() {
    $.ajax({
        url: 'ligas.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                ligas = response.ligas;
               $('#ligas-lista').empty();
                response.ligas.forEach(liga => agregarLigaATabla(liga));
            } else {
                alert("Error al cargar ligas: " + response.error);
            }
        }
    });
}

$(document).ready(function () {
    obtenerDatosLigas();

    document.getElementById('formCrearLiga').addEventListener('submit', function(event) {
        const nombreLiga = document.getElementById('nombre-liga');
        const EncargadoLiga = document.getElementById('encargado-liga');
        const numero = document.getElementById('telefono-encargado-liga');
        const limiteEquipos = document.getElementById('limites-equipos');
        const cuota = document.getElementById('cuota-equipo');
        const limiteJugadores = document.getElementById('limite-jugadores');

      
        
        const soloLetrasConTildes = /^[A-Za-zÀ-ÿ\s]{1,22}$/;
        if (!soloLetrasConTildes.test(nombreLiga.value)) {
            alert("El nombre de la liga solo debe contener letras.");
            nombreLiga.focus();
            event.preventDefault();
            return;
        }
        if (!soloLetrasConTildes.test(EncargadoLiga.value)) {
            alert("El nombre del encargado solo debe contener letras.");
            EncargadoLiga.focus();
            event.preventDefault();
            return;
        }
    
        if (!/^\d{8}$/.test(numero.value)) {
            alert("El numero tiene que tener 8 digitos.");
            numero.focus();
            event.preventDefault();
            return;
        }
        if (limiteEquipos.value < 1 || limiteEquipos.value > 32) {
            alert("El límite de equipos es de 32.");
            limiteEquipos.focus();
            event.preventDefault();
            return;
        }
        if (cuota.value > 9999) {
            alert("La cuota debe ser un valor de hasta 4 dígitos.");
            cuota.focus();
            event.preventDefault();
            return;
        }

        if (limiteJugadores.value < 1 || limiteJugadores.value > 20) {
            alert("El límite de jugadores debe estar entre 1 y 20.");
            limiteJugadores.focus();
            event.preventDefault();
            return;
        }
    });

   
    
    // Crear 
    $('#formCrearLiga').on('submit', function (event) {
        event.preventDefault();
        let formData = new FormData(this);
        $.ajax({
            url: 'ligas.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(response);
                if (response.success) {
                    $('#modalCrearLiga').modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    obtenerDatosLigas();
                    alert("Operación exitosa");
                } else {
                    alert("Error: " + response.error);
                }
            }
        });
    });

    // Eliminar jugador
    $('#ligas-lista').on('click', '.btn-eliminar', function () {
        const row = $(this).closest('tr');
        const ligaId = row.data('id');
        if (confirm("¿Estás seguro de eliminar la liga?")) {
            $.ajax({
                url: 'ligas.php',
                type: 'POST',
                data: { accion: "eliminar", liga_id: ligaId },
                success: function (response) {
                    if (response.success) {
                        row.remove();
                        alert("liga eliminada exitosamente");
                    } else {
                        alert("Error al eliminar liga: " + response.error);
                    }
                }
            });
        }
    });
});
