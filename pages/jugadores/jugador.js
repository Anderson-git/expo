let jugadores = [];
let jugadoresFiltrados = [];

// Mostrar modal para registrar jugador
function mostrarModalCrear() {
    document.getElementById('formCrearJugador').reset();
    document.getElementById('crearJugadorBtn').textContent = 'Guardar';
    document.getElementById('accion').value = 'crear';
    document.getElementById('modalFoto').src = '../../assets/img/logoFut.png';
    document.getElementById('modalCrearJugador').classList.add('show');
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', () => {
    const cerrarBtn = document.querySelector('.modal .close');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', () => {
            document.getElementById('modalCrearJugador').classList.remove('show');
        });
    }
});

// Vista previa de imagen
document.getElementById('foto-jugador').addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('modalFoto').src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Agrega fila a la tabla
function agregarJugadorATabla(jugador) {
    const row = `
    <tr data-id="${jugador.id}">
        <td><img src="data:image/jpeg;base64,${jugador.foto}" alt="Foto" width="50" height="50" style="border-radius:50%"></td>
        <td>${jugador.nombre}</td>
        <td>${jugador.apellido}</td>
        <td>${jugador.edad}</td>
        <td>${jugador.dpi}</td>
        <td>
            <button class="btn-edit" onclick="editarJugador(${jugador.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-eliminar"><i class="fas fa-trash-alt"></i></button>
        </td>
    </tr>`;
    document.getElementById('jugadores-lista').insertAdjacentHTML('beforeend', row);
}

// Obtener jugadores desde PHP
function obtenerJugadores() {
    fetch('jugador.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                jugadores = data.jugadores;
                document.getElementById('jugadores-lista').innerHTML = '';
                jugadores.forEach(jugador => agregarJugadorATabla(jugador));
            } else {
                alert("Error: " + data.error);
            }
        });
}

// Enviar formulario (crear o actualizar)
document.getElementById('formCrearJugador').addEventListener('submit', function (e) {
    e.preventDefault();

    const dpi = document.getElementById('dpi-jugador');
    const nombre = document.getElementById('nombre-jugador');
    const apellido = document.getElementById('apellido-jugador');
    const edad = document.getElementById('edad-jugador');

    const letrasRegex = /^[A-Za-zÀ-ÿ\s]{1,15}$/;
    if (!/^\d{13}$/.test(dpi.value)) return alert("DPI debe tener 13 dígitos.");
    if (!letrasRegex.test(nombre.value)) return alert("Nombre solo debe tener letras.");
    if (!letrasRegex.test(apellido.value)) return alert("Apellido solo debe tener letras.");
    if (edad.value < 1 || edad.value > 99) return alert("Edad entre 1 y 99.");

    const formData = new FormData(this);
    fetch('jugador.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                document.getElementById('modalCrearJugador').classList.remove('show');
                obtenerJugadores();
                alert("Guardado correctamente.");
            } else {
                alert("Error: " + response.error);
            }
        });
});

// Buscar jugadores
document.getElementById('btn-buscar-jugador').addEventListener('click', () => {
    const texto = document.getElementById('buscar-jugador').value.toLowerCase();
    filtrarJugadores(texto);
});

document.getElementById('buscar-jugador').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        filtrarJugadores(this.value.toLowerCase());
    }
});

function filtrarJugadores(texto) {
    const filtrados = jugadores.filter(j =>
        j.nombre.toLowerCase().includes(texto) ||
        j.apellido.toLowerCase().includes(texto) ||
        j.dpi.includes(texto)
    );
    document.getElementById('jugadores-lista').innerHTML = '';
    filtrados.forEach(jugador => agregarJugadorATabla(jugador));
}

// Editar jugador
function editarJugador(id) {
    const jugador = jugadores.find(j => j.id == id);
    if (jugador) {
        document.getElementById('jugador_id').value = jugador.id;
        document.getElementById('dpi-jugador').value = jugador.dpi;
        document.getElementById('nombre-jugador').value = jugador.nombre;
        document.getElementById('apellido-jugador').value = jugador.apellido;
        document.getElementById('edad-jugador').value = jugador.edad;
        document.getElementById('accion').value = 'actualizar';
        document.getElementById('crearJugadorBtn').textContent = 'Actualizar';
        document.getElementById('modalFoto').src = `data:image/jpeg;base64,${jugador.foto}`;
        document.getElementById('modalCrearJugador').classList.add('show');
    }
}

// Eliminar jugador
document.getElementById('jugadores-lista').addEventListener('click', function (e) {
    if (e.target.closest('.btn-eliminar')) {
        const fila = e.target.closest('tr');
        const id = fila.dataset.id;

        if (confirm("¿Eliminar jugador?")) {
            fetch('jugador.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `accion=eliminar&jugador_id=${id}`
            })
                .then(res => res.json())
                .then(response => {
                    if (response.success) {
                        fila.remove();
                        alert("Jugador eliminado.");
                    } else {
                        alert("Error: " + response.error);
                    }
                });
        }
    }
});

// Iniciar carga
document.addEventListener('DOMContentLoaded', obtenerJugadores);
