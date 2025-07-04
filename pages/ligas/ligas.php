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
     
        $nombre = $_POST['nombre_liga'];
        $encargado = $_POST['nombre_encargado'];
        $telefono = $_POST['telefono_encargado'];
        $limiteEquipos= $_POST['limite_equipos'];
        $Cuotas = $_POST['cuota_por_equipo'];
        $limiteJugadores = $_POST['limite_jugadores'];

       
        if (isset($_FILES['logo']) && $_FILES['logo']['error'] == 0) {
            $logo = base64_encode(file_get_contents($_FILES['logo']['tmp_name']));
        } else {
            $logo = base64_encode(file_get_contents('../../assets/img/logoFut.png'));
        }

       
        $stmt = $conexion->prepare("INSERT INTO ligas (nombre_liga, nombre_encargado, telefono_encargado, limite_equipos, cuota_por_equipo, limite_jugadores, logo) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiidis",  $nombre, $encargado, $telefono, $limiteEquipos, $Cuotas, $limiteJugadores,  $logo);

        if ($stmt->execute()) {
            $liga = [
                "id" => $stmt->insert_id,
                "nombre" => $nombre,
                "encargado" => $encargado,
                "telefono" => $telefono,
                "limiteEquipos" => $limiteEquipos,
                "Cuotas" => $Cuotas,
                "limiteJugadores" => $limiteJugadores,
                "logo" => $logo
            ];
            echo json_encode(["success" => true, "liga" => $liga]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();

    } else if ($accion === "actualizar") {
     
        $ligaId = $_POST['liga_id'];
        $nombre = $_POST['nombre_liga'];
        $encargado = $_POST['nombre_encargado'];
        $telefono = $_POST['telefono_encargado'];
        $limiteEquipos = $_POST['limite_equipos'];
        $Cuotas = $_POST['cuota_por_equipo'];
        $limiteJugadores = $_POST['limite_jugadores'];

        
        $logo = isset($_FILES['logo']['tmp_name']) && $_FILES['logo']['tmp_name'] !== ''
        ? base64_encode(file_get_contents($_FILES['logo']['tmp_name']))
        : null;
    

        if ($logo) {
            $stmt = $conexion->prepare("UPDATE ligas SET nombre_liga=?, nombre_encargado=?, telefono_encargado=?, limite_equipos=?, cuota_por_equipo=?, limite_jugadores=?, logo=? WHERE id=?");
            $stmt->bind_param("ssiidisi", $nombre, $encargado, $telefono, $limiteEquipos, $Cuotas, $limiteJugadores, $logo, $ligaId);
        } else {
            $stmt = $conexion->prepare("UPDATE ligas SET nombre_liga=?, nombre_encargado=?, telefono_encargado=?, limite_equipos=?, cuota_por_equipo=?, limite_jugadores=? WHERE id=?");
            $stmt->bind_param("ssiidii", $nombre, $encargado, $telefono, $limiteEquipos, $Cuotas, $limiteJugadores, $ligaId);
        }
        

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "liga" => [
                    "id" => $ligaId,
                    "nombre_liga" => $nombre,
                    "nombre_encargado" => $encargado,
                    "telefono_encargado" => $telefono,
                    "limite_equipos" => $limiteEquipos,
                    "cuota_por_equipo" => $Cuotas,
                    "limite_jugadores" => $limiteJugadores,
                    "logo" => $logo
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();

    } elseif ($accion === "eliminar") {
       
        $ligaId = $_POST['liga_id'];
        $stmt = $conexion->prepare("DELETE FROM ligas WHERE id = ?");
        $stmt->bind_param("i", $ligaId);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Error al eliminar la liga."]);
        }
        $stmt->close();
    }

} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
   
    $stmt = $conexion->prepare("SELECT * FROM ligas");

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $ligas = [];
        while ($row = $result->fetch_assoc()) {
            $ligas[] = [
                "id" => $row['id'],
                "logo" => $row['logo'],
                "nombre_liga" => $row['nombre_liga'],
                "nombre_encargado" => $row['nombre_encargado'],
                "telefono_encargado" => $row['telefono_encargado'],
                "limite_equipos" => $row['limite_equipos'],
                "cuota_por_equipo" => $row['cuota_por_equipo'],
                "limite_jugadores" => $row['limite_jugadores']
            ];
        }
        echo json_encode(["success" => true, "ligas" => $ligas]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

$conexion->close();
?>
