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
        // Inserción de un nuevo equipo
        $nombre = $_POST['nombre_equipo'];
        $encargado = $_POST['encargado_equipo'];
        $numero = $_POST['numero_encargado'];

        if (isset($_FILES['logo_Equipo']) && $_FILES['logo_equipo']['error'] == 0) {
            $logo = base64_encode(file_get_contents($_FILES['logo_equipo']['tmp_name']));
        } else {
            $logo = base64_encode(file_get_contents('../../assets/img/logoFut.png'));
        }

        $stmt = $conexion->prepare("INSERT INTO equipos (nombre_equipo, nombre_encargado, telefono_encargado, logo) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssis", $nombre, $encargado, $numero, $logo);
         
        if ($stmt->execute()) {
            $equipo = [
                "id" => $stmt->insert_id,
                "logo" => $logo,
                "nombre_equipo" => $nombre,
                "nombre_encargado" => $encargado,
                "telefono_encargado" => $numero,
            ];
            echo json_encode(["success" => true, "equipo" => $equipo]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    } else if ($accion === "actualizar") {
            $equipoId = $_POST['equipo_id'];
            $nombre = $_POST['nombre_equipo'];
            $encargado = $_POST['encargado_equipo'];
            $numero = $_POST['numero_encargado'];
            
            $logo = isset($_FILES['logo_equipo']['tmp_name']) && $_FILES['logo_equipo']['tmp_name'] !== '' 
                ? base64_encode(file_get_contents($_FILES['logo_equipo']['tmp_name'])) 
                : null;
    
            if ($logo) {
                // Actualizar con el nuevo logo
                $stmt = $conexion->prepare("UPDATE equipos SET nombre_equipo=?, nombre_encargado=?, telefono_encargado=?, logo=? WHERE id=?");
                $stmt->bind_param("ssisi", $nombre, $encargado, $numero, $logo, $equipoId);
            } else {
                // Actualizar sin cambiar el logo
                $stmt = $conexion->prepare("UPDATE equipos SET nombre_equipo=?, nombre_encargado=?, telefono_encargado=? WHERE id=?");
                $stmt->bind_param("ssii", $nombre, $encargado, $numero, $equipoId);
            }
    
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "equipo" => ["id" => $equipoId, "nombre_equipo" => $nombre, "nombre_encargado" => $encargado, "telefono_encargado" => $numero, "logo" => $logo]]);
            } else {
                echo json_encode(["success" => false, "error" => $stmt->error]);
            }
            $stmt->close();
    }elseif ($accion === "eliminar") {
            // Eliminación de un equipo
            $equipoId = $_POST['equipo_id'];
            $stmt = $conexion->prepare("DELETE FROM equipos WHERE id = ?");
            $stmt->bind_param("i", $equipoId);

            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => "Error al eliminar el equipo."]);
            }
            $stmt->close();
        }
        //mostrar a los equipos
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
        $stmt = $conexion->prepare("SELECT * FROM equipos");

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $equipos = [];
            while ($row = $result->fetch_assoc()) {
                $equipos[] = [
                    "id" => $row['id'],
                    "logo" => $row['logo'],
                    "nombre_equipo" => $row['nombre_equipo'],
                    "nombre_encargado" => $row['nombre_encargado'],
                    "telefono_encargado" => $row['telefono_encargado']
                ];
            }
            echo json_encode(["success" => true, "equipos" => $equipos]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }
        $stmt->close();
    }


$conexion->close();
?>