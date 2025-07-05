let canchas = [];
let canchasFiltradas = [];

// Filtrar canchas por nombre o estado
function filtrarCanchas(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase();
    canchasFiltradas = canchas.filter(cancha =>
        cancha.nombre.toLowerCase().includes(texto) ||
        cancha.estado.toLowerCase().includes(texto)
    );
    $('#canchas-lista').empty();
    canchasFiltradas.forEach(cancha => agregarCanchaATabla(cancha));
}

// Mostrar el modal para crear una nueva cancha
function mostrarModalCrear() {
    $('#nombre-cancha').val('');
    $('#estado-cancha').val('');
    $('#crearCanchaBtn').text('Guardar');
    $('#accion').val('crear');
    $('#modalCrearCancha').modal('show');
}

// Mostrar el modal con datos de una cancha existente para actualizar
function updateCancha(idCancha) {
    const cancha = canchas.find(c => c.id === idCancha);
    if (cancha) {
        $('#cancha_id').val(cancha.id);
        $('#nombre-cancha').val(cancha.nombre);
        $('#estado-cancha').val(cancha.estado);
        $('#crearCanchaBtn').text('Actualizar');
        $('#accion').val('actualizar');
        $('#modalCrearCancha').modal('show');
    } else {
        console.error('Cancha no encontrada');
    }
}

// Agregar una fila a la tabla para una cancha
function agregarCanchaATabla(cancha) {
    const row = `
    <tr data-id="${cancha.id}">
        <td>${cancha.nombre}</td>
        <td>${cancha.estado}</td>
        <td>
            <button id="btn-actualizar-${cancha.id}" class="btn btn-sm btn-warning btn-edit" onclick="updateCancha(${cancha.id});">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    </tr>
    `;
    $('#canchas-lista').append(row);
}

// Obtener la lista de canchas desde el servidor
function obtenerDatosCanchas() {
    $.ajax({
        url: 'crear-canchas.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                canchas = response.canchas;
                $('#canchas-lista').empty();
                response.canchas.forEach(cancha => agregarCanchaATabla(cancha));
            } else {
                alert("Error al cargar las canchas: " + response.error);
            }
        }
    });
}


$(document).ready(function () {
    obtenerDatosCanchas();
    $('#btn-buscar-cancha').click(function () {
        const textoBusqueda = $('#buscar-cancha').val().toLowerCase();
        filtrarCanchas(textoBusqueda);
    });

    $('#buscar-cancha').on('keyup', function (event) {
        if (event.key === 'Enter') {
            const textoBusqueda = $(this).val().toLowerCase();
            filtrarCanchas(textoBusqueda);
        }
    });


    // Crear o actualizar cancha
    $('#formCrearCancha').on('submit', function (event) {
        event.preventDefault();
        let formData = $(this).serialize();
        $.ajax({
            url: 'crear-canchas.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#modalCrearCancha').modal('hide');
                    obtenerDatosCanchas();
                    alert("Operación exitosa");
                } else {
                    alert("Error: " + response.error);
                }
            }
        });
    });

    // Eliminar cancha
    $('#canchas-lista').on('click', '.btn-eliminar', function () {
        const row = $(this).closest('tr');
        const canchaId = row.data('id');
        if (confirm("¿Estás seguro de eliminar esta cancha?")) {
            $.ajax({
                url: 'crear-canchas.php',
                type: 'POST',
                data: { accion: "eliminar", cancha_id: canchaId },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        row.remove();
                        alert("Cancha eliminada exitosamente");
                    } else {
                        alert("Error al eliminar la cancha: " + response.error);
                    }
                }
            });
        }
    });
});
