<?php
header('Content-Type: application/json');

$server = "127.0.0.1"; 
$user = "root";
$pass = "";
$db = "ligamaster";
$port = 3306; 
$conexion = new mysqli($server, $user, $pass, $db, $port);

if ($conexion->connect_errno) {
    echo json_encode(["success" => false, "error" => "Error de conexión: " . $conexion->connect_error]);
    exit();
}



$sql = "SELECT 
            p.id,
            l.nombre_liga AS liga,
            p.jornada,
            p.fecha,
            p.hora,
            p.equipo_local_id,
            p.equipo_visitante_id,
            el.logo AS logo_local,
            ev.logo AS logo_visita,
            el.nombre_equipo AS equipo_local,
            ev.nombre_equipo AS equipo_visitante,
            c.nombre AS cancha,
            p.gol_local,
            p.gol_visita,
            p.estado
        FROM partidos p
        INNER JOIN ligas l ON p.liga_id = l.id
        INNER JOIN equipos el ON p.equipo_local_id = el.id
        INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
        INNER JOIN canchas c ON p.cancha_id = c.id
        ORDER BY p.fecha, p.hora";

$result = $conexion->query($sql);

if ($result) {
    $partidos = [];
    while ($row = $result->fetch_assoc()) {
        $partidos[] = $row;
    }
    echo json_encode(['success' => true, 'partidos' => $partidos]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al ejecutar la consulta: ' . $conexion->error]);
}

$conexion->close();

?>