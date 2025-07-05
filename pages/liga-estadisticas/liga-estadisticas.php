<?php
header('Content-Type: application/json');

// Configuración de la conexión a la base de datos
$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";
$conexion = new mysqli($server, $user, $pass, $db, 3306);

// Verificar conexión
if ($conexion->connect_errno) {
    echo json_encode(["success" => false, "error" => "Error de conexión a la base de datos"]);
    exit();
}

// Manejo de peticiones GET
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Obtener goleadores
    if (isset($_GET['accion']) && $_GET['accion'] === 'goleadores' && isset($_GET['liga_id'])) {
        $liga_id = intval($_GET['liga_id']);
        $equipo_id = isset($_GET['equipo_id']) ? intval($_GET['equipo_id']) : null;

        // Consulta para obtener los goleadores
        $sql = "
            SELECT 
                j.nombre AS Jugador, 
                e.nombre_equipo AS Equipo, 
                COUNT(ev.id) AS Goles
            FROM eventos_partido ev
            INNER JOIN jugadores j ON ev.jugador_id = j.id
            INNER JOIN equipos e ON ev.equipo_id = e.id
            INNER JOIN partidos p ON ev.partido_id = p.id
            WHERE ev.evento_id = 1 AND p.liga_id = ?"; 

        if ($equipo_id) {
            $sql .= " AND ev.equipo_id = ?";
        }

        $sql .= " GROUP BY j.nombre, e.nombre_equipo ORDER BY Goles DESC";

        $stmt = $conexion->prepare($sql);

        if ($equipo_id) {
            $stmt->bind_param("ii", $liga_id, $equipo_id);
        } else {
            $stmt->bind_param("i", $liga_id);
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $goleadores = [];
            while ($row = $result->fetch_assoc()) {
                $goleadores[] = [
                    "nombre" => $row['Jugador'],
                    "nombre_equipo" => $row['Equipo'],
                    "goles" => $row['Goles']
                ];
            }
            echo json_encode(["success" => true, "goleadores" => $goleadores]);
        } else {
            echo json_encode(["success" => false, "error" => "Error en la consulta: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    }

    if (isset($_GET['accion']) && $_GET['accion'] === 'tarjetas' && isset($_GET['liga_id']) && isset($_GET['evento_id'])) {
        $liga_id = intval($_GET['liga_id']);
        $evento_id = intval($_GET['evento_id']); 
        $equipo_id = isset($_GET['equipo_id']) ? intval($_GET['equipo_id']) : null;

        $sql = "
            SELECT 
                j.nombre AS Jugador, 
                e.nombre_equipo AS Equipo, 
                COUNT(ev.id) AS Tarjetas
            FROM eventos_partido ev
            INNER JOIN jugadores j ON ev.jugador_id = j.id
            INNER JOIN equipos e ON ev.equipo_id = e.id
            INNER JOIN partidos p ON ev.partido_id = p.id
            WHERE ev.evento_id = ? AND p.liga_id = ?";

        if ($equipo_id) {
            $sql .= " AND ev.equipo_id = ?";
        }

        $sql .= " GROUP BY j.nombre, e.nombre_equipo ORDER BY Tarjetas DESC";

        $stmt = $conexion->prepare($sql);

        if ($equipo_id) {
            $stmt->bind_param("iii", $evento_id, $liga_id, $equipo_id);
        } else {
            $stmt->bind_param("ii", $evento_id, $liga_id);
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $tarjetas = [];
            while ($row = $result->fetch_assoc()) {
                $tarjetas[] = [
                    "nombre" => $row['Jugador'],
                    "nombre_equipo" => $row['Equipo'],
                    "tarjetas" => $row['Tarjetas']
                ];
            }
            echo json_encode(["success" => true, "tarjetas" => $tarjetas]);
        } else {
            echo json_encode(["success" => false, "error" => "Error en la consulta: " . $stmt->error]);
        }
        $stmt->close();
        exit();
        
    }if (isset($_GET['accion']) && $_GET['accion'] === 'equipos_goles_recibidos' && isset($_GET['liga_id'])) {
        $liga_id = intval($_GET['liga_id']);
    
        $sql = "
            SELECT 
                e.id AS equipo_id, 
                e.nombre_equipo AS equipo, 
                IFNULL(SUM(
                    CASE 
                        WHEN e.id = p.equipo_local_id THEN p.gol_visita 
                        WHEN e.id = p.equipo_visitante_id THEN p.gol_local 
                    END
                ), 0) AS goles_recibidos
            FROM equipos e
            LEFT JOIN partidos p 
            ON e.id = p.equipo_local_id OR e.id = p.equipo_visitante_id
            WHERE p.liga_id = ?
            GROUP BY e.id, e.nombre_equipo
            ORDER BY goles_recibidos ASC";
    
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $liga_id);
    
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $equipos = [];
            while ($row = $result->fetch_assoc()) {
                $equipos[] = [
                    "id" => $row['equipo_id'],
                    "nombre" => $row['equipo'],
                    "goles_recibidos" => $row['goles_recibidos']
                ];
            }
            echo json_encode(["success" => true, "equipos" => $equipos]);
        } else {
            echo json_encode(["success" => false, "error" => "Error en la consulta: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    }

    // Obtener ligas y equipos
    $ligas = [];
    $equipos = [];

    // Obtener todas las ligas
    $stmtLigas = $conexion->prepare("SELECT * FROM ligas");
    if ($stmtLigas->execute()) {
        $resultLigas = $stmtLigas->get_result();
        while ($row = $resultLigas->fetch_assoc()) {
            $ligas[] = [
                "id" => $row['id'],
                "nombre_liga" => $row['nombre_liga'],
                "limite_equipos" => $row['limite_equipos']
            ];
        }
    }
    $stmtLigas->close();

    // Obtener equipos por liga
    if (isset($_GET['liga_id'])) {
        $liga_id = intval($_GET['liga_id']);
        $stmtEquipos = $conexion->prepare("
            SELECT e.id, e.nombre_equipo 
            FROM equipos e
            JOIN ligas_equipos le ON e.id = le.equipo_id
            WHERE le.liga_id = ?");
        $stmtEquipos->bind_param("i", $liga_id);

        if ($stmtEquipos->execute()) {
            $resultEquipos = $stmtEquipos->get_result();
            while ($row = $resultEquipos->fetch_assoc()) {
                $equipos[] = [
                    "id" => $row['id'],
                    "nombre_equipo" => $row['nombre_equipo']
                ];
            }
        }
        $stmtEquipos->close();
    }

    echo json_encode([
        "success" => true,
        "ligas" => $ligas,
        "equipos" => $equipos
    ]);
}

$conexion->close();
?>
