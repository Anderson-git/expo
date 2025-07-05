<?php
$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";

$conexion = new mysqli($server, $user, $pass, $db, 3306);

if ($conexion->connect_errno) {
    die("Conexion Fallida: " . $conexion->connect_error);
}

function calcularCategoria($edad) {
    if ($edad >= 5 && $edad <= 7) return 'Prebenjamín';
    if ($edad >= 8 && $edad <= 9) return 'Benjamín';
    if ($edad >= 10 && $edad <= 11) return 'Alevín';
    if ($edad >= 12 && $edad <= 13) return 'Infantil';
    if ($edad >= 14 && $edad <= 15) return 'Cadete';
    if ($edad >= 16 && $edad <= 18) return 'Juvenil';
    return 'No aplica';
}

$mensaje = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['buscar'])) {
    $input = $conexion->real_escape_string($_POST['buscar']);
    $resultado = $conexion->query("SELECT * FROM Jugadores WHERE nombre LIKE '%$input%' OR apellido LIKE '%$input%' OR dpi LIKE '%$input%' LIMIT 1");

    if ($resultado && $jugador = $resultado->fetch_assoc()) {
        $edad = $jugador['edad'];
        $categoria = calcularCategoria($edad);

        if ($categoria === 'No aplica') {
            $mensaje = "<div class='alert alert-warning mt-3'>El jugador <strong>{$jugador['nombre']} {$jugador['apellido']}</strong> no puede ser inscrito porque su edad no está entre 5 y 18 años.</div>";
        } else {
            $verificar = $conexion->prepare("SELECT id FROM Academia WHERE jugador_id = ? LIMIT 1");
            $verificar->bind_param("i", $jugador['id']);
            $verificar->execute();
            $verificar->store_result();

            if ($verificar->num_rows > 0) {
                $mensaje = "<div class='alert alert-info mt-3'>El jugador <strong>{$jugador['nombre']} {$jugador['apellido']}</strong> ya está inscrito en la academia.</div>";
            } else {
                $insert = $conexion->prepare("INSERT INTO Academia (jugador_id, categoria) VALUES (?, ?)");
                $insert->bind_param("is", $jugador['id'], $categoria);
                $insert->execute();
                $mensaje = "<div class='alert alert-success mt-3'>Jugador inscrito exitosamente:<br><strong>{$jugador['nombre']} {$jugador['apellido']}</strong><br>Edad: {$edad}<br>Categoría: {$categoria}</div>";
            }
        }
    } else {
        $mensaje = "<div class='alert alert-danger mt-3'>No se encontró ningún jugador.</div>";
    }
}

$filtro_categoria = isset($_GET['categoria']) ? $conexion->real_escape_string($_GET['categoria']) : "";
$filtro_general = isset($_GET['buscar_tabla']) ? $conexion->real_escape_string($_GET['buscar_tabla']) : "";

$query = "SELECT j.nombre, j.apellido, j.dpi, j.edad, a.categoria, a.fecha_inscripcion FROM Academia a JOIN Jugadores j ON j.id = a.jugador_id WHERE 1";

if (!empty($filtro_categoria)) {
    $query .= " AND a.categoria = '$filtro_categoria'";
}
if (!empty($filtro_general)) {
    $query .= " AND (j.nombre LIKE '%$filtro_general%' OR j.apellido LIKE '%$filtro_general%' OR j.dpi LIKE '%$filtro_general%' OR j.edad LIKE '%$filtro_general%')";
}

$jugadores_filtrados = $conexion->query($query);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Inscripción a la Academia</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <h2 class="mb-4">Buscar Jugador para Inscripción a Academia</h2>
    <form method="POST" class="row g-3">
        <div class="col-md-6">
            <input type="text" name="buscar" id="buscar" class="form-control" placeholder="Nombre, Apellido o DPI" required>
        </div>
        <div class="col-md-2">
            <button type="submit" class="btn btn-primary">Buscar e Inscribir</button>
        </div>
    </form>

    <?= $mensaje ?>

    <hr class="my-5">

    <h2 class="mb-4">Filtrar Jugadores por Categoría y Búsqueda General</h2>
    <form method="GET" class="row g-3">
        <div class="col-md-3">
            <select name="categoria" id="categoria" class="form-select">
                <option value="">Todas</option>
                <option value="Prebenjamín" <?= $filtro_categoria == 'Prebenjamín' ? 'selected' : '' ?>>Prebenjamín</option>
                <option value="Benjamín" <?= $filtro_categoria == 'Benjamín' ? 'selected' : '' ?>>Benjamín</option>
                <option value="Alevín" <?= $filtro_categoria == 'Alevín' ? 'selected' : '' ?>>Alevín</option>
                <option value="Infantil" <?= $filtro_categoria == 'Infantil' ? 'selected' : '' ?>>Infantil</option>
                <option value="Cadete" <?= $filtro_categoria == 'Cadete' ? 'selected' : '' ?>>Cadete</option>
                <option value="Juvenil" <?= $filtro_categoria == 'Juvenil' ? 'selected' : '' ?>>Juvenil</option>
            </select>
        </div>
        <div class="col-md-5">
            <input type="text" name="buscar_tabla" id="buscar_tabla" class="form-control" placeholder="Buscar por nombre, apellido, edad o DPI" value="<?= htmlspecialchars($filtro_general) ?>">
        </div>
        <div class="col-md-2">
            <button type="submit" class="btn btn-success">Filtrar</button>
        </div>
    </form>

    <hr class="my-5">

    <h2 class="mb-4">Listado de Jugadores Inscritos</h2>
    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>DPI</th>
                    <th>Edad</th>
                    <th>Categoría</th>
                    <th>Fecha de Inscripción</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($fila = $jugadores_filtrados->fetch_assoc()) { ?>
                    <tr>
                        <td><?= htmlspecialchars($fila['nombre']) ?></td>
                        <td><?= htmlspecialchars($fila['apellido']) ?></td>
                        <td><?= htmlspecialchars($fila['dpi']) ?></td>
                        <td><?= htmlspecialchars($fila['edad']) ?></td>
                        <td><span class="badge bg-primary"><?= htmlspecialchars($fila['categoria']) ?></span></td>
                        <td><?= htmlspecialchars($fila['fecha_inscripcion']) ?></td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
