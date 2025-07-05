let partidos = [];

let jugadoresFiltrados = [];

function filtrarJugadores(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase();
    jugadoresFiltrados = partidos.filter(jugador =>
        jugador.nombre.toLowerCase().includes(texto) ||
        jugador.apellido.toLowerCase().includes(texto) ||
        jugador.dpi.toString().includes(texto)
    );
    $('#jugadores-lista').empty();
    jugadoresFiltrados.forEach(jugador => agregarJugadorATabla(jugador));
}

function mostrarModalCrear() {
    $('#dpi-jugador').val('');
    $('#nombre-jugador').val('');
    $('#apellido-jugador').val('');
    $('#edad-jugador').val('');
    $('#foto-jugador').val('');
    $('#crearJugadorBtn').text('Guardar');
    $('#accion').val('crear');
    $('#modalFoto').attr('src', '../../assets/img/logoFut.png').show();
    $('#modalCrearJugador').modal('show');
}


function updatePlayer(idJugador) {
    const jugador = partidos.find(j => j.id === idJugador);
    if (jugador) {
        $('#jugador_id').val(jugador.id);
        $('#dpi-jugador').val(jugador.dpi);
        $('#nombre-jugador').val(jugador.nombre);
        $('#apellido-jugador').val(jugador.apellido);
        $('#edad-jugador').val(jugador.edad);

        // Muestra la imagen actual en el modal si existe
        if (jugador.foto) {
            $('#modalFoto').attr('src', `data:image/jpeg;base64,${jugador.foto}`).css('display', 'block');
        } else {
            $('#modalFoto').hide();
        }

        $('#crearJugadorBtn').text("Actualizar");
        $('#accion').val('actualizar');
        $('#modalCrearJugador').modal('show');
    } else {
        console.error('Jugador no encontrado');
    }
}

// Vista previa de la imagen seleccionada
$('#foto-jugador').on('change', function (event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $('#modalFoto').attr('src', e.target.result).css('display', 'block');
    };
    reader.readAsDataURL(event.target.files[0]);
});


function agregarJugadorATabla(jugador) {
    const row = `
    <tr data-id="${jugador.id}">
        <td><img src="data:image/jpeg;base64,${jugador.foto}" width="50"></td>
        <td>${jugador.nombre}</td>
        <td>${jugador.apellido}</td>
        <td>${jugador.edad}</td>
        <td>${jugador.dpi}</td>
        <td>
            <button id="btn-actualizar-${jugador.id}" class="btn btn-sm btn-warning btn-edit"  onclick="updatePlayer(${jugador.id});"> 
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    </tr>
    `;
    $('#jugadores-lista').append(row);
}

function obtenerDatosJugadores() {
    $.ajax({
        url: 'jugador.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                partidos = response.jugadores;
                $('#jugadores-lista').empty();
                response.jugadores.forEach(jugador => agregarJugadorATabla(jugador));
            } else {
                alert("Error al cargar jugadores: " + response.error);
            }
        }
    });
}

$(document).ready(function () {
    // Cargar jugadores al iniciar
    obtenerDatosJugadores();
    document.getElementById('formCrearJugador').addEventListener('submit', function(event) {
        const dpi = document.getElementById('dpi-jugador');
        const nombre = document.getElementById('nombre-jugador');
        const apellido = document.getElementById('apellido-jugador');
        const edad = document.getElementById('edad-jugador');
        
    
        if (!/^\d{13}$/.test(dpi.value)) {
            alert("El DPI debe contener exactamente 13 dígitos numéricos.");
            dpi.focus();
            event.preventDefault();
            return;
        }

       
        const soloLetrasConTildes = /^[A-Za-zÀ-ÿ\s]{1,15}$/;
        if (!soloLetrasConTildes.test(nombre.value)) {
            alert("El nombre solo debe contener letras.");
            nombre.focus();
            event.preventDefault();
            return;
        }

        if (!soloLetrasConTildes.test(apellido.value)) {
            alert("El apellido solo debe contener letras.");
            apellido.focus();
            event.preventDefault();
            return;
        }
        
        if (edad.value < 1 || edad.value > 99) {
            alert("La edad debe estar entre 1 y 99 años.");
            edad.focus();
            event.preventDefault();
            return;
        }
    });

    $('#btn-buscar-jugador').click(function () {
        const textoBusqueda = $('#buscar-jugador').val().toLowerCase();
        filtrarJugadores(textoBusqueda);
    });

    // También permite la búsqueda al presionar Enter en el campo de entrada
    $('#buscar-jugador').on('keyup', function (event) {
        if (event.key === 'Enter') {
            const textoBusqueda = $(this).val().toLowerCase();
            filtrarJugadores(textoBusqueda);
        }
    });



    // Crear o actualizar jugador
    $('#formCrearJugador').on('submit', function (event) {
        event.preventDefault();
        let formData = new FormData(this);
        $.ajax({
            url: 'jugador.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    $('#modalCrearJugador').modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    obtenerDatosJugadores();
                    alert("Operación exitosa");
                } else {
                    alert("Error: " + response.error);
                }
            }
        });
    });

    // Eliminar jugador
    $('#jugadores-lista').on('click', '.btn-eliminar', function () {
        const row = $(this).closest('tr');
        const jugadorId = row.data('id');
        if (confirm("¿Estás seguro de eliminar el jugador?")) {
            $.ajax({
                url: 'jugador.php',
                type: 'POST',
                data: { accion: "eliminar", jugador_id: jugadorId },
                success: function (response) {
                    if (response.success) {
                        row.remove();
                        alert("Jugador eliminado exitosamente");
                    } else {
                        alert("Error al eliminar jugador: " + response.error);
                    }
                }
            });
        }
    });
});


