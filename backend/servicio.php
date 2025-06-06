<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Permitir solicitudes preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    exit; 
}

// Conexión a la base de datos
$mysqli = new mysqli("sql108.infinityfree.com", "if0_39016022", "jUiF8cTGgnFT9yS", "if0_39016022_rally_fotografico");
//si hay error en la conexión, se muestra un mensaje de error
if ($mysqli->connect_error) {
    die("Error de conexión: " . $mysqli->connect_error);
}

// Verifica si se hace una petición GET y si es para listar archivos
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['peticion']) && $_GET['peticion'] === 'listarArchivos') {
    $imagenes = listarArchivosDesdeBaseDeDatos();
    echo json_encode(['imagenes' => $imagenes]);
    exit;
}
//convierte el JSON recibido en un objeto PHP
$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

if ($objeto === null) {
    http_response_code(400);
    echo json_encode(["error" => "El JSON recibido es inválido"]);
    exit;
}

// $objeto = new stdClass();
// $objeto -> servicio = "listarUsuarios";

// El resto de las funcionalidades (usuarios, etc.) se mantienen igual
if ($objeto != null && isset($objeto->servicio)) {
    switch ($objeto->servicio) {
        case "listarUsuarios":
            echo json_encode(listadoUsuarios());
            break;
        case "crearUsuario":
            crearUsuario($objeto);
            echo json_encode(listadoUsuarios());
            break;
        case "iniciarSesion":
            echo json_encode(iniciarSesion($objeto->email, $objeto->password));
            break;
        case "actualizarUsuario":
            echo json_encode(actualizarUsuario($objeto));
            break;
        case "eliminarUsuario":
            echo json_encode(eliminarUsuario($objeto->id));
            break;
        case "registrarImagen":
            registrarImagen($objeto);
            echo json_encode(['success' => true, 'mensaje' => 'Imagen registrada correctamente']);
            break;
        case "listarFotosPorUsuario":
            echo json_encode(listarFotosPorUsuario($objeto->usuario_id));
            break;
        case "eliminarFoto":
            echo json_encode(eliminarFoto($objeto->id));
            break;
        case "actualizarLikes":
            echo json_encode(actualizarLikes($objeto->id));
            break;
        case "listarArchivos":
            $imagenes = listarArchivosDesdeBaseDeDatos();
            echo json_encode(['imagenes' => $imagenes]);
            break;
        case "actualizarNombreFoto":
            echo json_encode(actualizarNombreFoto($objeto->id, $objeto->nuevoNombre));
            break;
        case "actualizarFotoPerfil":
            echo json_encode(actualizarFotoPerfil($objeto->usuario_id, $objeto->base64));
            break;
        case "getUsuario":
            echo json_encode(getUsuario($objeto->id));
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Servicio no reconocido']);
    }
}

//lista todos los usuarios de la base de datos
function listadoUsuarios(){
    global $mysqli;
    try{
        $sql = "SELECT * FROM usuarios order by id desc";
        $stm = $mysqli->prepare($sql);
        $stm->execute();
        $result = $stm->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }catch(Exception $e){
        return ("Error".$e->getMessage());
    }
}

// Crea un nuevo usuario en la base de datos
function crearUsuario($objeto){
    global $mysqli;

    // Validacione nombre
    if (!isset($objeto->nombre) || strlen(trim($objeto->nombre)) <= 1) {
        http_response_code(400);
        echo json_encode(["error" => "Nombre inválido, debe tener al menos 1 caracter"]);
        exit;
    }
    //email
    if (!isset($objeto->email) || !filter_var($objeto->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Email inválido"]);
        exit;
    }
    //contraseña
    if (!isset($objeto->password) || strlen($objeto->password) < 4) {
        http_response_code(400);
        echo json_encode(["error" => "Contraseña demasiado corta (mínimo 4 caracteres)"]);
        exit;
    }

    // Comprobar si el email ya existe
    $check = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ?");
    $check->bind_param("s", $objeto->email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        http_response_code(409); // Conflicto
        echo json_encode(["error" => "El email ya está registrado"]);
        exit;
    }

    // Cifrado seguro de contraseña
    $passwordSegura = password_hash($objeto->password, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("sss", $objeto->nombre, $objeto->email, $passwordSegura);
    $stmt->execute();
    return true;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error interno: " . $e->getMessage()]);
    return false;
}
}

// Inicia sesión verificando el email y la contraseña
function iniciarSesion($email, $password) {
    global $mysqli;
    try {
        $sql = "SELECT id, nombre, email, password, rol, fecha_registro FROM usuarios WHERE email = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 1) {
            $usuario = $res->fetch_assoc();

            // Verificar la contraseña usando password_verify
            if (password_verify($password, $usuario['password'])) {
                unset($usuario['password']);
                return ['success' => true, 'usuario' => $usuario];
            } else {
                return ['success' => false, 'error' => 'Contraseña o usuario incorrectos'];
            }
        } else {
            return ['success' => false, 'error' => 'Usuario o contraseña incorrectos'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}


// Actualiza los datos de un usuario
function actualizarUsuario($objeto) {
    global $mysqli;

    // Validacion nombre
    if (!isset($objeto->nombre) || strlen(trim($objeto->nombre)) <= 1) {
        return ['success' => false, 'error' => 'Nombre inválido, debe tener al menos 1 caracter'];
    }
    //email
    if (!isset($objeto->email) || !filter_var($objeto->email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Email inválido'];
    }

    // Verificar si el email ya existe en otro usuario
    $check = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    $check->bind_param("si", $objeto->email, $objeto->id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        return ['success' => false, 'error' => 'El email ya está en uso por otro usuario'];
    }

    try {
        if (isset($objeto->password) && !empty($objeto->password)) {
            if (strlen($objeto->password) < 4) {
                return ['success' => false, 'error' => 'La contraseña debe tener al menos 4 caracteres'];
            }

            // Cifrar la nueva contraseña
            $passwordHash = password_hash($objeto->password, PASSWORD_DEFAULT);

            $sql = "UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $stmt->bind_param("sssi", $objeto->nombre, $objeto->email, $passwordHash, $objeto->id);
        } else {
            $sql = "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $stmt->bind_param("ssi", $objeto->nombre, $objeto->email, $objeto->id);
        }

        if ($stmt->execute()) {
            return ['success' => true, 'mensaje' => 'Usuario actualizado'];
        } else {
            return ['success' => false, 'error' => 'No se pudo actualizar'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Error interno: ' . $e->getMessage()];
    }
}

// Elimina un usuario y sus fotos asociadas
function eliminarUsuario($id) {
    global $mysqli;
    try {
        // Eliminar fotos relacionadas con el usuario (si el usuario tiene fotos)
        $sqlFotos = "DELETE FROM fotografias WHERE usuario_id = ?";
        $stmtFotos = $mysqli->prepare($sqlFotos);
        $stmtFotos->bind_param("i", $id);
        $stmtFotos->execute();

        // Eliminar el usuario de la tabla de usuarios
        $sqlUsuario = "DELETE FROM usuarios WHERE id = ?";
        $stmtUsuario = $mysqli->prepare($sqlUsuario);
        $stmtUsuario->bind_param("i", $id);
        $stmtUsuario->execute();

        // Verificar si se eliminó algún registro
        if ($stmtUsuario->affected_rows > 0) {
            return ['success' => true, 'mensaje' => 'Cuenta eliminada correctamente.'];
        } else {
            return ['success' => false, 'error' => 'No se encontró el usuario o no se pudo eliminar.'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Función para obtener el número de fotos subidas por un usuario
function obtenerFotosSubidas($usuario_id) {
    global $mysqli;
    try {
        $sql = "SELECT COUNT(*) AS fotosSubidas FROM fotografias WHERE usuario_id = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        return $data['fotosSubidas'] ?? 0;
    } catch (Exception $e) {
        return 0; // Si hay un error, devolver 0 fotos subidas
    }
}

// IMÁGENES
// Registra una nueva imagen en la base de datos
function registrarImagen($objeto) {
    global $mysqli;
    try {
        // Validar tamaño máximo (10MB)
        $base64 = $objeto->base64;
        $base64Length = strlen($base64) - strpos($base64, ',') - 1;
        $padding = substr($base64, -2) === '==' ? 2 : (substr($base64, -1) === '=' ? 1 : 0);
        $decodedSize = ($base64Length * 3) / 4 - $padding;

        if ($decodedSize > 10 * 1024 * 1024) { // 10MB
            echo json_encode(['success' => false, 'error' => 'La imagen supera el límite de 10MB.']);
            exit();
        }

        $sql = "INSERT INTO fotografias (usuario_id, nombre, base64) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("iss", $objeto->usuario_id, $objeto->nombre, $objeto->base64);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'mensaje' => 'Imagen registrada correctamente']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// Lista las fotos subidas por un usuario específico
function listarFotosPorUsuario($usuario_id) {
    global $mysqli;
    try {
        $sql = "SELECT * FROM fotografias WHERE usuario_id = ? ORDER BY id DESC";
        $stm = $mysqli->prepare($sql);
        $stm->bind_param("i", $usuario_id);
        $stm->execute();
        $result = $stm->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    } catch (Exception $e) {
        return ["error" => $e->getMessage()];
    }
}

// Elimina una foto específica de la base de datos
function eliminarFoto($id) {
    global $mysqli;
    try {
        $sql = "DELETE FROM fotografias WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return ['success' => true, 'mensaje' => 'Foto eliminada correctamente'];
        } else {
            return ['success' => false, 'error' => 'No se pudo eliminar la foto'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Actualiza el número de likes de una foto específica
function actualizarLikes($foto_id) {
    global $mysqli;
    try {
        $sql = "UPDATE fotografias SET likes = likes + 1 WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("i", $foto_id);
        $stmt->execute();
        return ['success' => true, 'mensaje' => 'Like actualizado'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Función para listar archivos desde la base de datos
function listarArchivosDesdeBaseDeDatos() {
    global $mysqli;
    try {
        // Consulta para obtener todas las imágenes desde la base de datos
        $sql = "SELECT id, nombre, base64, likes FROM fotografias ORDER BY id DESC";
        $stm = $mysqli->prepare($sql);
        $stm->execute();
        $result = $stm->get_result();
        
        // Almacena las imágenes en un array
        $imagenes = [];
        while ($row = $result->fetch_assoc()) {
            $imagenes[] = [
                'id' => $row['id'],
                'nombre' => $row['nombre'],
                'base64' => $row['base64'],
                'likes' => $row['likes'],
            ];
        }
        
        return $imagenes;
    } catch (Exception $e) {
        return ["error" => $e->getMessage()];
    }
}

// Actualiza el nombre de una foto específica
function actualizarNombreFoto($id, $nuevoNombre) {
    global $mysqli;
    try {
        $sql = "UPDATE fotografias SET nombre = ? WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("si", $nuevoNombre, $id);
        if ($stmt->execute()) {
            return ['success' => true];
        } else {
            return ['success' => false, 'error' => 'No se pudo actualizar el nombre'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Actualiza la foto de perfil de un usuario
function actualizarFotoPerfil($usuario_id, $base64) {
    global $mysqli;

    if (!$usuario_id || !$base64) {
        return ['success' => false, 'error' => 'Datos incompletos'];
    }

    try {
        $sql = "UPDATE usuarios SET imagen_perfil = ? WHERE id = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("si", $base64, $usuario_id);

        if ($stmt->execute()) {
            return ['success' => true];
        } else {
            return ['success' => false, 'error' => 'Error al actualizar en la base de datos'];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Obtiene los datos de un usuario específico por su ID
function getUsuario($id) {
    global $mysqli;
    $sql = "SELECT id, nombre, email, rol, fecha_registro, imagen_perfil FROM usuarios WHERE id = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    return $resultado->fetch_assoc();
}



