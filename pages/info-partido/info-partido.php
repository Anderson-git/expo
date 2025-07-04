<?php 
header('Content-Type: application/json');

$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";
$port = 3306;

// Conexión a la base de datos
$conexion = new mysqli($server, $user, $pass, $db, $port);
if ($conexion->connect_errno) {
    echo json_encode(["success" => false, "error" => "Error de conexión: " . $conexion->connect_error]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Obtener detalles del partido
    if (isset($_GET['partidoId'])) {
        $partidoId = intval($_GET['partidoId']);

        $sqlPartido = "SELECT p.id,
            el.id AS equipo_local_id, el.nombre_equipo AS equipo_local, el.logo AS logo_local,
            ev.id AS equipo_visitante_id, ev.nombre_equipo AS equipo_visitante, ev.logo AS logo_visitante,
            p.gol_local,
            p.gol_visita
            FROM partidos p
            INNER JOIN equipos el ON p.equipo_local_id = el.id
            INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
            WHERE p.id = ?";
        $stmtPartido = $conexion->prepare($sqlPartido);
        $stmtPartido->bind_param('i', $partidoId);
        $stmtPartido->execute();
        $resultPartido = $stmtPartido->get_result();

        $sqlEventosPartido = 'SELECT ev.id, e.nombre_equipo, j.nombre as nombre_jugador, te.nombre as evento FROM eventos_partido ev
        INNER JOIN equipos e on ev.equipo_id = e.id
        INNER JOIN jugadores j on ev.jugador_id = j.id
        Inner JOIN tipo_eventos te on ev.evento_id = te.id
        WHERE ev.partido_id = ?';
        $stmtEventoPartido = $conexion->prepare($sqlEventosPartido);
        $stmtEventoPartido->bind_param('i', $partidoId);
        $stmtEventoPartido->execute();
        $resultEventos = $stmtEventoPartido->get_result();
 
        if ($resultPartido &&  $resultEventos  ) {
            $partido = $resultPartido->fetch_assoc();
            $eventos = [];
            while ($row = $resultEventos->fetch_assoc()) {
                $eventos[] = $row;
            }
            echo json_encode([
                "success" => true,
                "partido" => $partido,
                "eventos" => $eventos
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al ejecutar la consulta: ' . $conexion->error]);
        }
        exit();
    }

}

$conexion->close();
?>
