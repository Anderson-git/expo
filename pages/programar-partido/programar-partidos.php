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
    $ligas = [];
    $equipos = [];
    $canchas = [];

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

    // Obtener canchas
    $stmtCanchas = $conexion->prepare("SELECT * FROM canchas");
    if ($stmtCanchas->execute()) {
        $resultCanchas = $stmtCanchas->get_result();
        while ($row = $resultCanchas->fetch_assoc()) {
            $canchas[] = [
                "id" => $row['id'],
                "nombre" => $row['nombre'],
            ];
        }
        $stmtCanchas->close();
    }

    // Obtención de equipos por liga_id
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
                    "nombre_equipo" => $row['nombre_equipo'],
                    "logo" => $row['logo']
                ];
            }
            $stmtEquipos->close();
        }
    }


    // Si se pasa un id_partido, obtenemos los datos de ese partido
    if (isset($_GET['id_partido'])) {
        $id_partido = intval($_GET['id_partido']);
        $stmtPartido = $conexion->prepare("SELECT * FROM Partidos WHERE id = ?");
        $stmtPartido->bind_param("i", $id_partido);
        if ($stmtPartido->execute()) {
            $resultPartido = $stmtPartido->get_result();
            if ($resultPartido->num_rows > 0) {
                $partido = $resultPartido->fetch_assoc();
                echo json_encode([
                    "success" => true,
                    "partido" => $partido
                ]);
                exit();
            }
        }
        $stmtPartido->close();
    }

    echo json_encode([
        "success" => true,
        "ligas" => $ligas,
        "equipos" => $equipos,
        "canchas" => $canchas
    ]);
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['accion'])) {
    $accion = $_POST['accion'];

    $liga_id = isset($_POST['liga_id']) ? intval($_POST['liga_id']) : null;
    $jornada = isset($_POST['jornada']) ? $_POST['jornada'] : null;
    $equipo_local_id = isset($_POST['equipo_local_id']) ? intval($_POST['equipo_local_id']) : null;
    $equipo_visitante_id = isset($_POST['equipo_visitante_id']) ? intval($_POST['equipo_visitante_id']) : null;
    $fecha = isset($_POST['fecha']) ? $_POST['fecha'] : null;
    $hora = isset($_POST['hora']) ? $_POST['hora'] : null;
    $cancha_id = isset($_POST['cancha_id']) ? intval($_POST['cancha_id']) : null;
    $id_partido = isset($_POST['partidoId']) ? intval($_POST['partidoId']) : null;

    if (!$liga_id || !$jornada || !$equipo_local_id || !$equipo_visitante_id || !$fecha || !$hora || !$cancha_id) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit();
    }

    if ($accion === "actualizar" && $id_partido) {
        $stmt = $conexion->prepare("UPDATE Partidos SET 
            liga_id = ?, jornada = ?, fecha = ?, hora = ?, 
            equipo_local_id = ?, equipo_visitante_id = ?, cancha_id = ? 
            WHERE id = ?");
        $stmt->bind_param("isssiiii", $liga_id, $jornada, $fecha, $hora, $equipo_local_id, $equipo_visitante_id, $cancha_id, $id_partido);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Partido actualizado correctamente"]);
        } else {
            echo json_encode(["success" => false, "error" => "Error al actualizar el partido: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        $stmt = $conexion->prepare("INSERT INTO Partidos (liga_id, jornada, fecha, hora, equipo_local_id, equipo_visitante_id, cancha_id, gol_local, gol_visita, estado, puntos_local, puntos_visita) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0)");
        $stmt->bind_param("isssiii", $liga_id, $jornada, $fecha, $hora, $equipo_local_id, $equipo_visitante_id, $cancha_id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Partido agregado correctamente"]);
        } else {
            echo json_encode(["success" => false, "error" => "Error al agregar el partido: " . $stmt->error]);
        }

        $stmt->close();
    }
}

$conexion->close();
?>