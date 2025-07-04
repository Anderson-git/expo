let lstEquipos = [];
let lstEquiposfiltrados = [];

// Función para filtrar equipos por búsqueda
function filtrarEquipo(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase();
    lstEquiposfiltrados = lstEquipos.filter(equipo =>
        equipo.nombre_equipo.toLowerCase().includes(texto) ||
        equipo.nombre_encargado.toLowerCase().includes(texto) ||
        equipo.telefono_encargado.toString().includes(texto)
    );
    $('#equipos-lista').empty();
    lstEquiposfiltrados.forEach(equipo => agregarEquipoATabla(equipo));
}

// Función para mostrar el modal de creación de equipo
function mostrarCrearEquipo() {
    $('#nombre-equipo').val('');
    $('#encargado-equipo').val('');
    $('#numero-encargado').val('');
    $('#logo-equipo').val('');
    $('#crearEquipoBtn').text('Guardar');
    $('#accion').val('crear');
    $('#modalLogo').attr('src', '../../assets/img/logoFut.png').show();
    $('#modalCrearEquipo').modal('show');
}
// Función para editar un equipo
function updateEquipo(idEquipo) {
    const equipo = lstEquipos.find(j => j.id === idEquipo);
    if (equipo) {
        $('#equipo_id').val(equipo.id);
        $('#nombre-equipo').val(equipo.nombre_equipo);
        $('#encargado-equipo').val(equipo.nombre_encargado);
        $('#numero-encargado').val(equipo.telefono_encargado);


        if (equipo.logo) {
            $('#modalLogo').attr('src', `data:image/jpeg;base64,${equipo.logo}`).css('display', 'block');
        } else {
            $('#modalLogo').hide();
        }

        $('#crearEquipoBtn').text("Actualizar");
        $('#accion').val('actualizar');
        $('#modalCrearEquipo').modal('show');
    } else {
        console.error('Equipo no encontrado');
    }
}

// Función para previsualizar el logo seleccionado
$('#logo-equipo').on('change', function (event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $('#modalLogo').attr('src', e.target.result).css('display', 'block');
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Función para agregar un equipo a la tabla
function agregarEquipoATabla(equipo) {
    const row = `
    <tr data-id="${equipo.id}">
        <td><img src="data:image/jpeg;base64,${equipo.logo}" width="50"></td>
        <td>${equipo.nombre_equipo}</td>
        <td>${equipo.nombre_encargado}</td>
        <td>${equipo.telefono_encargado}</td>
        <td>
            <button  id="btn-actualizar-${equipo.id}" class="btn btn-sm btn-warning btn-edit" onclick="updateEquipo(${equipo.id});"> 
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar">
                <i class="fas fa-trash-alt"></i>
            </button>
            <button class="btn btn-info btn-sm" onclick="verDetalles('Equipo 1')">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    </tr>
    `;
    $('#equipos-lista').append(row);
}

function obtenerDatosEquipos() {
    $.ajax({
        url: 'equipo.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const equipos = response.equipos;
                lstEquipos = equipos;
                $('#equipos-lista').empty();
                equipos.forEach(equipo => agregarEquipoATabla(equipo));
            } else {
                alert("Error al cargar equipos: " + response.error);
            }
        },
    });
}

// Inicialización de eventos y funciones al cargar la página
$(document).ready(function () {
    obtenerDatosEquipos();

    document.getElementById('formCrearEquipo').addEventListener('submit', function(event) {
        const nombreEquipo = document.getElementById('nombre-equipo');
        const nombreEncargado = document.getElementById('nombre-encargado');
        const numero = document.getElementById('numero-encargado');
        
        const soloLetrasConTildes = /^[A-Za-zÀ-ÿ\s]{1,15}$/;
        if (!soloLetrasConTildes.test(nombreEquipo.value)) {
            alert("El nombre equipo solo debe contener letras.");
            nombreEquipo.focus();
            event.preventDefault();
            return;
        }
        if (!soloLetrasConTildes.test(nombreEncargado.value)) {
            alert("El nombre encargado solo debe contener letras.");
            nombreEncargado.focus();
            event.preventDefault();
            return;
        }
    
        if (!/^\d{8}$/.test(numero.value)) {
            alert("El numero tiene que tener 8 digitos.");
            numero.focus();
            event.preventDefault();
            return;
        }

    
    });
    $('#btn-buscar-equipo').click(function () {
        const textoBusqueda = $('#buscar-equipo').val().toLowerCase();
        filtrarEquipo(textoBusqueda);
    });

    $('#buscar-equipo').on('keyup', function (event) {
        if (event.key === 'Enter') {
            const textoBusqueda = $(this).val().toLowerCase();
            filtrarEquipo(textoBusqueda);
        }
    });

    $('#formCrearEquipo').on('submit', function (event) {
        event.preventDefault();
        let formData = new FormData(this);
        $.ajax({
            url: 'equipo.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    $('#modalCrearEquipo').modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    obtenerDatosEquipos();
                    alert("operacion exitosa");

                } else {
                    alert("Error: " + response.error);
                }
            },
        });
    });


    // Eliminar equipo
    $('#equipos-lista').on('click', '.btn-eliminar', function () {
        const row = $(this).closest('tr');
        const equipoId = row.data('id');
        if (confirm("¿Estás seguro de eliminar el equipo?")) {
            $.ajax({
                url: 'equipo.php',
                type: 'POST',
                data: { accion: "eliminar", equipo_id: equipoId },
                success: function (response) {
                    if (response.success) {
                        row.remove();
                        alert("Equipo eliminado exitosamente");
                    } else {
                        alert("Error al eliminar equipo: " + response.error);
                    }
                }
            });
        }
    });
});

