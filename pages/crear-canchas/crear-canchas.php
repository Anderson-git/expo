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
        // Crear nueva cancha
        $nombre = $_POST['nombre_cancha'];
        $estado = $_POST['estado_cancha'];

        $stmt = $conexion->prepare("INSERT INTO Canchas (nombre, estado) VALUES (?, ?)");
        $stmt->bind_param("ss", $nombre, $estado);

        if ($stmt->execute()) {
            $cancha = [
                "id" => $stmt->insert_id,
                "nombre" => $nombre,
                "estado" => $estado
            ];
            echo json_encode(["success" => true, "cancha" => $cancha]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    } elseif ($accion === "actualizar") {
        // Actualizar cancha
        $canchaId = $_POST['cancha_id'];
        $nombre = $_POST['nombre_cancha'];
        $estado = $_POST['estado_cancha'];

        $stmt = $conexion->prepare("UPDATE Canchas SET nombre=?, estado=? WHERE id=?");
        $stmt->bind_param("ssi", $nombre, $estado, $canchaId);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "cancha" => ["id" => $canchaId, "nombre" => $nombre, "estado" => $estado]]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    } elseif ($accion === "eliminar") {
        // Eliminar cancha
        $canchaId = $_POST['cancha_id'];
        $stmt = $conexion->prepare("DELETE FROM Canchas WHERE id = ?");
        $stmt->bind_param("i", $canchaId);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Error al eliminar la cancha."]);
        }
        $stmt->close();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Listar canchas
    $stmt = $conexion->prepare("SELECT * FROM Canchas");

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $canchas = [];
        while ($row = $result->fetch_assoc()) {
            $canchas[] = [
                "id" => $row['id'],
                "nombre" => $row['nombre'],
                "estado" => $row['estado']
            ];
        }
        header('Content-Type: application/json');
        echo json_encode(["success" => true, "canchas" => $canchas]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}
$conexion->close();
?>