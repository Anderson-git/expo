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

if ($_SERVER["REQUEST_METHOD"] == "GET") {

    $stmtLigas = $conexion->prepare("SELECT * FROM ligas");
    $ligas = [];
    if ($stmtLigas->execute()) {
        $resultLigas = $stmtLigas->get_result();
        while ($row = $resultLigas->fetch_assoc()) {
            $ligas[] = [
                "id" => $row['id'],
                "logo" => $row['logo'],
                "nombre_liga" => $row['nombre_liga'],
                "limite_equipos" => $row['limite_equipos'],
            ];
        }
        $stmtLigas->close();
    } else {
        echo json_encode(["success" => false, "error" => $stmtLigas->error]);
        exit();
    }

    // Obtener lista de equipos
    $stmtEquipos = $conexion->prepare("SELECT * FROM equipos");
    $equipos = [];
    if ($stmtEquipos->execute()) {
        $resultEquipos = $stmtEquipos->get_result();
        while ($row = $resultEquipos->fetch_assoc()) {
            $equipos[] = [
                "id" => $row['id'],
                "logo" => $row['logo'],
                "nombre_equipo" => $row['nombre_equipo'],
            ];
        }
        $stmtEquipos->close();
    } else {
        echo json_encode(["success" => false, "error" => $stmtEquipos->error]);
        exit();
    }

    // Responder con ligas y equipos
    echo json_encode([
        "success" => true,
        "ligas" => $ligas,
        "equipos" => $equipos
    ]);
}
if ($_SERVER["REQUEST_METHOD"] == "POST"  && isset($_POST['action']) && $_POST['action']=='inserta' && isset($_POST['equipo_id'], $_POST['liga_id'])) {
    $equipo_id = $_POST['equipo_id'];
    $liga_id = $_POST['liga_id'];
    $stmtInsert = $conexion->prepare("INSERT INTO Ligas_Equipos (liga_id, equipo_id) VALUES (?, ?)");
    $stmtInsert->bind_param("ii", $liga_id, $equipo_id);
    if ($stmtInsert->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmtInsert->error]);
    }
    $stmtInsert->close();
} 

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'get_equipos_agregados') {
    $liga_id = $_POST['liga_id'];
    $stmtEquiposAgregados = $conexion->prepare("
        SELECT e.id, e.nombre_equipo, e.logo, l.nombre_liga
        FROM Ligas_Equipos le
        JOIN equipos e ON le.equipo_id = e.id
        JOIN ligas l ON le.liga_id = l.id
        WHERE le.liga_id = ?
    ");
    $stmtEquiposAgregados->bind_param("i", $liga_id);
    $equipos = [];
    if ($stmtEquiposAgregados->execute()) {
        $resultEquiposAgregados = $stmtEquiposAgregados->get_result();
        while ($row = $resultEquiposAgregados->fetch_assoc()) {
            $equipos[] = [
                "nombre_equipo" => $row['nombre_equipo'],
                "logo" => $row['logo'],
                "id"  => $row['id']
            ];
            $liga_nombre = $row['nombre_liga'];
        }
        echo json_encode(["success" => true, "liga_nombre" => $liga_nombre, "equipos" => $equipos]);
    } else {
        echo json_encode(["success" => false, "error" => $stmtEquiposAgregados->error]);
    }
    $stmtEquiposAgregados->close();
}
else if (isset($_POST['action']) && $_POST['action'] === "eliminar" && isset($_POST['equipo_id'])) {
    $equipoId = $_POST['equipo_id'];
    $ligaId = $_POST['liga_id'];
    $stmt = $conexion->prepare("DELETE FROM Ligas_Equipos WHERE equipo_id = ?  and liga_id = ?");
    $stmt->bind_param("ii", $equipoId, $ligaId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Error al eliminar el equipo."]);
    }
    $stmt->close();
}
$conexion->close();
?>
