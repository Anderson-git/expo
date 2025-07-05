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

        $sqlPartido = "SELECT p.id, p.fecha, p.hora, p.cancha_id, l.nombre_liga,
            el.id AS equipo_local_id, el.nombre_equipo AS equipo_local, el.logo AS logo_local,
            ev.id AS equipo_visitante_id, ev.nombre_equipo AS equipo_visitante, ev.logo AS logo_visitante
            FROM partidos p
            INNER JOIN ligas l ON p.liga_id = l.id
            INNER JOIN equipos el ON p.equipo_local_id = el.id
            INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
            WHERE p.id = ?";
        $stmtPartido = $conexion->prepare($sqlPartido);
        $stmtPartido->bind_param('i', $partidoId);
        $stmtPartido->execute();
        $resultPartido = $stmtPartido->get_result();

        if ($partido = $resultPartido->fetch_assoc()) {
            $equipos = [
                [
                    "id" => $partido["equipo_local_id"],
                    "nombre" => $partido["equipo_local"],
                    "logo" => $partido["logo_local"]
                ],
                [
                    "id" => $partido["equipo_visitante_id"],
                    "nombre" => $partido["equipo_visitante"],
                    "logo" => $partido["logo_visitante"]
                ]
            ];

            echo json_encode([
                "success" => true,
                "partido" => $partido,
                "equipos" => $equipos
            ]);
        } else {
            echo json_encode(["success" => false, "error" => "Partido no encontrado."]);
        }
        exit();
    }

    // Obtener jugadores del equipo
    if (isset($_GET['equipo_id'])) {
        $equipoId = intval($_GET['equipo_id']);

        $sqlJugadores = "SELECT j.id, j.nombre, j.foto 
                         FROM jugadores j
                         INNER JOIN Ligas_Equipos_jugadores lej ON j.id = lej.jugador_id
                         WHERE lej.equipo_id = ?";
        $stmtJugadores = $conexion->prepare($sqlJugadores);
        $stmtJugadores->bind_param("i", $equipoId);
        $stmtJugadores->execute();
        $resultJugadores = $stmtJugadores->get_result();

        $jugadores = [];
        while ($row = $resultJugadores->fetch_assoc()) {
            $jugadores[] = [
                "id" => $row['id'],
                "nombre" => $row['nombre'],
                "foto" => $row['foto']
            ];
        }

        echo json_encode([
            "success" => true,
            "jugadores" => $jugadores
        ]);
        exit();
    }

    // Obtener tipos de eventos
    $stmtEventos = $conexion->prepare("SELECT id, nombre FROM tipo_eventos");
    $eventos = [];
    if ($stmtEventos->execute()) {
        $resultEventos = $stmtEventos->get_result();
        while ($row = $resultEventos->fetch_assoc()) {
            $eventos[] = [
                "id" => $row['id'],
                "nombre" => $row['nombre'],
            ];
        }
        $stmtEventos->close();
    }

    echo json_encode([
        "success" => true,
        "eventos" => $eventos
    ]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        echo json_encode(["success" => false, "error" => "JSON inválido"]);
        exit();
    }

    // Procesar eventos
    if (isset($data['eventos']) && is_array($data['eventos'])) {
        $sql = "INSERT INTO eventos_partido (partido_id, equipo_id, jugador_id, evento_id) VALUES (?, ?, ?, ?)";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            echo json_encode(["success" => false, "error" => "Error al preparar la consulta de eventos: " . $conexion->error]);
            exit();
        }

        foreach ($data['eventos'] as $evento) {
            $stmt->bind_param(
                'iiii',
                $evento['partidoId'],
                $evento['equipoId'],
                $evento['jugadorId'],
                $evento['eventoId']
            );
            $stmt->execute();
        }

        $stmt->close();
    }

    if (isset($data['marcador'])) {
        $marcador = $data['marcador'];
        $partidoId = $marcador['partidoId'];
        $golLocal = $marcador['golLocal'];
        $golVisita = $marcador['golVisita'];
        $puntosLocal =0;
        $puntosVisita =0;
        $estado =1;
        if($golLocal > $golVisita){
            $puntosLocal = 3;
        }else if($golVisita > $golLocal ){
            $puntosVisita = 3;
        }else{
             $puntosLocal = 1; 
             $puntosVisita = 1;
        }


        $sqlMarcador = "UPDATE partidos SET gol_local = ?, gol_visita = ? , estado=?, puntos_local=?, puntos_visita=? WHERE id = ?";
        $stmtMarcador = $conexion->prepare($sqlMarcador);

        if ($stmtMarcador) {
            $stmtMarcador->bind_param(
                'iiiiii',
                $golLocal, 
                $golVisita,
                $estado,
                $puntosLocal,
                $puntosVisita,
                $partidoId
            );
            $stmtMarcador->execute();
            $stmtMarcador->close();
        } else {
            echo json_encode(["success" => false, "error" => "Error al preparar la consulta del marcador: " . $conexion->error]);
            exit();
        }
    }

    echo json_encode(["success" => true, "message" => "Datos guardados correctamente.", "data" => $data]);
}

$conexion->close();
?>
