<?php
header('Content-Type: application/json');
$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";

$conexion = new mysqli($server, $user, $pass, $db, 3306);

if ($conexion->connect_errno) {
    echo json_encode(["success" => false, "error" => "Error de conexión"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['accion'])) {
    $accion = $_POST['accion'];

    if ($accion === "crear") {
        // Inserción de un nuevo jugador
        $dpi = $_POST['dpi_jugador'];
        $nombre = $_POST['nombre_jugador'];
        $apellido = $_POST['apellido_jugador'];
        $edad = $_POST['edad_jugador'];

        // Verificar si hay una foto cargada
        if (isset($_FILES['foto_jugador']) && $_FILES['foto_jugador']['error'] == 0) {
            $foto = base64_encode(file_get_contents($_FILES['foto_jugador']['tmp_name']));
        } else {
            // Asigna una imagen base64 o la URL de tu imagen por defecto.
            $foto = base64_encode(file_get_contents('../../assets/img/logoFut.png'));
        }

        // Preparar la consulta para insertar el jugador
        $stmt = $conexion->prepare("INSERT INTO jugadores (dpi, nombre, apellido, edad, foto) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssis", $dpi, $nombre, $apellido, $edad, $foto);

        if ($stmt->execute()) {
            $jugador = [
                "id" => $stmt->insert_id,
                "dpi" => $dpi,
                "nombre" => $nombre,
                "apellido" => $apellido,
                "edad" => $edad,
                "foto" => $foto
            ];
            echo json_encode(["success" => true, "jugador" => $jugador]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    }else if($accion === "actualizar") {
        $jugadorId = $_POST['jugador_id'];
        $dpi = $_POST['dpi_jugador'];
        $nombre = $_POST['nombre_jugador'];
        $apellido = $_POST['apellido_jugador'];
        $edad = $_POST['edad_jugador'];
        $foto = isset($_FILES['foto_jugador']['tmp_name']) && $_FILES['foto_jugador']['tmp_name'] !== ''
        ? base64_encode(file_get_contents($_FILES['foto_jugador']['tmp_name']))
        : null;
    
        if ($foto) {
            // Actualizar con la nueva foto
            $stmt = $conexion->prepare("UPDATE jugadores SET dpi=?, nombre=?, apellido=?, edad=?, foto=? WHERE id=?");
            $stmt->bind_param("sssisi", $dpi, $nombre, $apellido, $edad, $foto, $jugadorId);
        } else {
            // Actualizar sin cambiar la foto
            $stmt = $conexion->prepare("UPDATE jugadores SET dpi=?, nombre=?, apellido=?, edad=? WHERE id=?");
            $stmt->bind_param("sssii", $dpi, $nombre, $apellido, $edad, $jugadorId);
        }
    
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "jugador" => ["id" => $jugadorId, "dpi" => $dpi, "nombre" => $nombre, "apellido" => $apellido, "edad" => $edad, "foto" => $foto]]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    } elseif ($accion === "eliminar") {
        // Eliminación de un jugador
        $jugadorId = $_POST['jugador_id'];
        $stmt = $conexion->prepare("DELETE FROM jugadores WHERE id = ?");
        $stmt->bind_param("i", $jugadorId);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Error al eliminar el jugador."]);
        }
        $stmt->close();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Obtener lista de jugadores
    $stmt = $conexion->prepare("SELECT * FROM jugadores");

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $jugadores = [];
        while ($row = $result->fetch_assoc()) {
            $jugadores[] = [
                "id" => $row['id'],
                "dpi" => $row['dpi'],
                "nombre" => $row['nombre'],
                "apellido" => $row['apellido'],
                "edad" => $row['edad'],
                "foto" => $row['foto']
            ];
        }
        header('Content-Type: application/json');
        echo json_encode(["success" => true, "jugadores" => $jugadores]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}
$conexion->close();
?>