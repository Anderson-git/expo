CREATE DATABASE ligamaster;
use ligamaster;

-- Tabla de Jugadores
CREATE TABLE IF NOT EXISTS Jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    edad INT NOT NULL,
    foto TEXT,  -- Imagen en Base64
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS Equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo TEXT,  -- Logo en Base64
    nombre_equipo VARCHAR(50) NOT NULL,
    nombre_encargado VARCHAR(50) NOT NULL,
    telefono_encargado VARCHAR(8) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ligas (con limite_jugadores agregado)
CREATE TABLE IF NOT EXISTS Ligas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo TEXT,
    nombre_liga VARCHAR(50) NOT NULL,
    nombre_encargado VARCHAR(50) NOT NULL,
    telefono_encargado VARCHAR(8) NOT NULL,
    limite_equipos INT NOT NULL,
    limite_jugadores INT NOT NULL,  -- 🔹 Campo agregado
    cuota_por_equipo DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Canchas
CREATE TABLE IF NOT EXISTS Canchas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(15) NOT NULL,
    estado ENUM('Disponible', 'Ocupado', 'En mantenimiento') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asignación de Equipos a Ligas
CREATE TABLE IF NOT EXISTS Ligas_Equipos (
    equipo_id INT NOT NULL,
    liga_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (equipo_id, liga_id),
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id),
    FOREIGN KEY (liga_id) REFERENCES Ligas(id)
);

-- Tabla de asignación de Jugadores a Equipos y Ligas
CREATE TABLE IF NOT EXISTS Ligas_Equipos_Jugadores (
    equipo_id INT NOT NULL,
    liga_id INT NOT NULL,
    jugador_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (equipo_id, liga_id, jugador_id),
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id),
    FOREIGN KEY (liga_id) REFERENCES Ligas(id),
    FOREIGN KEY (jugador_id) REFERENCES Jugadores(id)
);

-- Tabla de Partidos
CREATE TABLE IF NOT EXISTS Partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    liga_id INT NOT NULL,
    jornada INT NOT NULL, 
    fecha DATE NOT NULL, 
    hora TIME NOT NULL, 
    equipo_local_id INT NOT NULL, 
    equipo_visitante_id INT NOT NULL,
    cancha_id INT NOT NULL,
    gol_local INT DEFAULT 0,
    gol_visita INT DEFAULT 0,
    puntos_local INT DEFAULT 0,
    puntos_visita INT DEFAULT 0,
    estado INT DEFAULT 0,  -- 0: pendiente, 1: finalizado
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liga_id) REFERENCES Ligas(id),
    FOREIGN KEY (equipo_local_id) REFERENCES Equipos(id),
    FOREIGN KEY (equipo_visitante_id) REFERENCES Equipos(id),
    FOREIGN KEY (cancha_id) REFERENCES Canchas(id)
);

-- Tabla de Tipos de Evento (gol, tarjeta amarilla, tarjeta roja, etc.)
CREATE TABLE IF NOT EXISTS tipo_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,        
    nombre VARCHAR(50) NOT NULL
);

-- Tabla de Eventos de Partido
CREATE TABLE IF NOT EXISTS eventos_partido (
    id INT AUTO_INCREMENT PRIMARY KEY,        
    partido_id INT NOT NULL,                 
    equipo_id INT NOT NULL,                  
    jugador_id INT NOT NULL,                 
    evento_id INT NOT NULL,
    FOREIGN KEY (partido_id) REFERENCES Partidos(id), 
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id),  
    FOREIGN KEY (jugador_id) REFERENCES Jugadores(id), 
    FOREIGN KEY (evento_id) REFERENCES tipo_eventos(id)
);

INSERT INTO tipo_eventos (nombre) VALUES
('Gol'),
('Tarjeta Amarilla'),
('Tarjeta Roja');
