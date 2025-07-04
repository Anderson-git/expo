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
    $stmt = $conexion->prepare("SELECT * FROM ligas");

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $ligas = [];
        while ($row = $result->fetch_assoc()) {
            $ligas[] = [
                "id" => $row['id'],
                "logo" => $row['logo'],
                "nombre_liga" => $row['nombre_liga'],
                "limite_equipos" => $row['limite_equipos'],
                "cuota_por_equipo" => $row['cuota_por_equipo']
            ];
        }
        echo json_encode(["success" => true, "ligas" => $ligas]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'get_equipos_agregados') {
    if (!isset($_POST['liga_id'])) {
        echo json_encode(["success" => false, "error" => "Liga ID no proporcionado"]);
        exit();
    }

    $liga_id = intval($_POST['liga_id']);
    $stmtEquiposAgregados = $conexion->prepare("
        SELECT e.id, e.nombre_equipo, e.logo
        FROM Ligas_Equipos le
        JOIN equipos e ON le.equipo_id = e.id
        WHERE le.liga_id = ?
    ");
    $stmtEquiposAgregados->bind_param("i", $liga_id);
    $equipos = [];
    if ($stmtEquiposAgregados->execute()) {
        $resultEquiposAgregados = $stmtEquiposAgregados->get_result();
        while ($row = $resultEquiposAgregados->fetch_assoc()) {
            $equipos[] = [
                "id" => $row['id'],
                "nombre_equipo" => $row['nombre_equipo'],
                "logo" => $row['logo']
            ];
        }
        echo json_encode(["success" => true, "equipos" => $equipos]);
    } else {
        echo json_encode(["success" => false, "error" => $stmtEquiposAgregados->error]);
    }
    $stmtEquiposAgregados->close();
}

$conexion->close();
?>
