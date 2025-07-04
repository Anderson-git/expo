<?php


$server = "127.0.0.1";
$user = "root";
$pass = "";
$db = "ligamaster";

$conexion = new mysqli($server, $user, $pass, $db,3306);

if ($conexion->connect_errno) {
    die("Conexion Fallida " . $conexion->connect_errno);
} else {
    echo "conectado";
}
?>
