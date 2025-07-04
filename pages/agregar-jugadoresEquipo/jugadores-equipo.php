<?php
header('Content-Type: application/json');

// Configuración de conexión
$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";
$conexion = new mysqli($server, $user, $pass, $db, 3306);

if ($conexion->connect_errno) {
    echo json_encode(["success" => false, "error" => "Error de conexión"]);
    exit();
}

// Gestión de solicitudes
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $ligas = [];
    $equipos = [];
    $jugadores = [];

    // Obtener ligas
    $stmtLigas = $conexion->prepare("SELECT * FROM ligas");
    if ($stmtLigas->execute()) {
        $resultLigas = $stmtLigas->get_result();
        while ($row = $resultLigas->fetch_assoc()) {
            $ligas[] = [
                "id" => $row['id'],
                "nombre_liga" => $row['nombre_liga'],
                "limite_equipos" => $row['limite_equipos'],
            ];
        }
        $stmtLigas->close();
    }

    // Obtener jugadores
    $stmtJugadores = $conexion->prepare("SELECT * FROM jugadores");
    if ($stmtJugadores->execute()) {
        $resultJugadores = $stmtJugadores->get_result();
        while ($row = $resultJugadores->fetch_assoc()) {
            $jugadores[] = [
                "id" => $row['id'],
                "nombre" => $row['nombre'],
                "apellido" => $row['apellido'],
                "foto" => $row['foto'],
            ];
        }
        $stmtJugadores->close();
    }

    // Si se especifica una liga, obtener equipos
    if (isset($_GET['liga_id'])) {
        $liga_id = intval($_GET['liga_id']);
        $stmtEquipos = $conexion->prepare("SELECT e.id, e.logo, e.nombre_equipo 
                                           FROM equipos e 
                                           JOIN Ligas_Equipos le ON e.id = le.equipo_id 
                                           WHERE le.liga_id = ?");
        $stmtEquipos->bind_param("i", $liga_id);

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
        }
    }

    echo json_encode(["success" => true, "ligas" => $ligas, "equipos" => $equipos, "jugadores" => $jugadores]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action == 'inserta_jugador' && isset($_POST['liga_id'], $_POST['equipo_id'], $_POST['jugador_id'])) {
        $liga_id = intval($_POST['liga_id']);
        $equipo_id = intval($_POST['equipo_id']);
        $jugador_id = intval($_POST['jugador_id']);

        $stmtInsertJugador = $conexion->prepare("INSERT INTO Ligas_Equipos_Jugadores (liga_id, equipo_id, jugador_id) VALUES (?, ?, ?)");
        $stmtInsertJugador->bind_param("iii", $liga_id, $equipo_id, $jugador_id);

        if ($stmtInsertJugador->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmtInsertJugador->error]);
        }
        $stmtInsertJugador->close();
        exit();
    }

    if ($action == 'get_jugadores_agregados' && isset($_POST['liga_id'], $_POST['equipo_id'])) {
        $liga_id = intval($_POST['liga_id']);
        $equipo_id = intval($_POST['equipo_id']);
        $jugadores = [];

        $stmtJugadoresAgregados = $conexion->prepare("SELECT j.id, j.nombre, j.apellido, j.foto 
                                                      FROM Ligas_Equipos_Jugadores lej
                                                      JOIN jugadores j ON lej.jugador_id = j.id
                                                      WHERE lej.equipo_id = ? AND lej.liga_id = ?");
        $stmtJugadoresAgregados->bind_param("ii", $equipo_id, $liga_id);

        if ($stmtJugadoresAgregados->execute()) {
            $result = $stmtJugadoresAgregados->get_result();
            while ($row = $result->fetch_assoc()) {
                $jugadores[] = [
                    "id" => $row['id'],
                    "nombre" => $row['nombre'],
                    "apellido" => $row['apellido'],
                    "foto" =>$row['foto'],
                ];
            }
            echo json_encode(["success" => true, "jugadores" => $jugadores]);
        } else {
            echo json_encode(["success" => false, "error" => $stmtJugadoresAgregados->error]);
        }
        $stmtJugadoresAgregados->close();
        exit();
    }
    if ($action == 'eliminar_jugador' && isset($_POST['liga_id'], $_POST['equipo_id'], $_POST['jugador_id'])) {
        $liga_id = intval($_POST['liga_id']);
        $equipo_id = intval($_POST['equipo_id']);
        $jugador_id = intval($_POST['jugador_id']);
    
        $stmtEliminarJugador = $conexion->prepare("DELETE FROM Ligas_Equipos_Jugadores WHERE liga_id = ? AND equipo_id = ? AND jugador_id = ?");
        $stmtEliminarJugador->bind_param("iii", $liga_id, $equipo_id, $jugador_id);
    
        if ($stmtEliminarJugador->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmtEliminarJugador->error]);
        }
        $stmtEliminarJugador->close();
        exit();
    }    
}
echo json_encode(["success" => false, "error" => "Acción no reconocida"]);

$conexion->close();
?>
