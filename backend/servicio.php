<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Permitir solicitudes preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    exit; // Terminar la ejecución para las solicitudes preflight
}

// Conexión a la base de datos
$mysqli = new mysqli("sql108.infinityfree.com", "if0_39016022", "jUiF8cTGgnFT9yS", "if0_39016022_rally_fotografico");


if ($mysqli->connect_error) {
    die("Error de conexión: " . $mysqli->connect_error);
}

// Verifica si se hace una petición GET y si es para listar archivos
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['peticion']) && $_GET['peticion'] === 'listarArchivos') {
    $imagenes = listarArchivosDesdeBaseDeDatos();
    echo json_encode(['imagenes' => $imagenes]);
    exit;
}

$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

if ($objeto === null) {
    http_response_code(400);
    echo json_encode(["error" => "El JSON recibido es inválido"]);
    exit;
}

// $objeto = new stdClass();
// $objeto -> servicio = "listarUsuarios";

// Verificar la petición POST
// Verifica si se hace una petición POST y si es para crear un archivo
if (isset($_POST['peticion']) && $_POST['peticion'] == 'crearArchivo') {
    // Verifica si se ha recibido un archivo
    if (isset($_FILES['archivo'])) {
        // Elimina la línea de var_dump para evitar la salida no válida
        // var_dump($_FILES['archivo']); // Esta línea debe ser eliminada

        $archivo = $_FILES['archivo'];
        
        // Definir el destino para el archivo
        $directorioDestino = "imagenes/" . basename($archivo['name']);
        
        // Mover el archivo a la carpeta de destino
        if (move_uploaded_file($archivo['tmp_name'], $directorioDestino)) {
            echo json_encode(['success' => true, 'mensaje' => 'Archivo subido correctamente']);
        } else {
            echo json_encode(['error' => 'Error al mover el archivo']);
        }
    } else {
        echo json_encode(['error' => 'No se recibió el archivo']);
    }
    exit;
}


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
        case 'contarFotosUsuario':
            echo json_encode(contarFotosPorUsuario($objeto->id_usuario));
            break;
        case 'contarVotosUsuario':
             if (!isset($objeto->id_usuario)) {
        echo json_encode(['error' => 'Falta el id_usuario']);
        break;
    }

    $resultado = contarVotosPorUsuario(intval($objeto->id_usuario));
    echo json_encode($resultado);
    break;

        default:
            echo json_encode(['success' => false, 'error' => 'Servicio no reconocido']);
    }
}


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

function crearUsuario($objeto){
    global $mysqli;

    // Validaciones básicas
    if (!isset($objeto->nombre) || strlen(trim($objeto->nombre)) <= 1) {
        http_response_code(400);
        echo json_encode(["error" => "Nombre inválido"]);
        exit;
    }

    if (!isset($objeto->email) || !filter_var($objeto->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Email inválido"]);
        exit;
    }

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

            // Verificamos la contraseña con password_verify directamente
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




function actualizarUsuario($objeto) {
    global $mysqli;
    try {
        if (isset($objeto->password) && !empty($objeto->password)) {
            $sql = "UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $stmt->bind_param("sssi", $objeto->nombre, $objeto->email, $objeto->password, $objeto->id);
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
        return ['success' => false, 'error' => $e->getMessage()];
    }
}


function eliminarUsuario($id) {
    global $mysqli;
    try {
        // Eliminar fotos relacionadas con el usuario (si es necesario)
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

function registrarImagen($objeto) {
    global $mysqli;
    try {
        $sql = "INSERT INTO fotografias (usuario_id, nombre, base64) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("iss", $objeto->usuario_id, $objeto->nombre, $objeto->base64);
        $stmt->execute();
        
        // Respuesta exitosa
        echo json_encode(['success' => true, 'mensaje' => 'Imagen registrada correctamente']);
    } catch (Exception $e) {
        // Si ocurre un error, devuelve un error en formato JSON
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit(); // Asegura que no se envíen más datos al cliente
}



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
        
        // Almacena las imágenes en un arreglo
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

function getUsuario($id) {
    global $mysqli;
    $sql = "SELECT id, nombre, email, rol, fecha_registro, imagen_perfil FROM usuarios WHERE id = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    return $resultado->fetch_assoc();
}

function contarFotosPorUsuario($usuario_id) {
    global $mysqli;

    $sql = "SELECT COUNT(*) AS total FROM fotografias WHERE usuario_id = ?";
    $stmt = $mysqli->prepare($sql);
    
    if ($stmt === false) {
        return ['error' => 'Error al preparar la consulta.'];
    }

    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $stmt->bind_result($total);
    $stmt->fetch();
    $stmt->close();

    return ['total' => $total];
}

function contarVotosPorUsuario($usuario_id) {
    global $mysqli;

    if (!isset($mysqli)) {
        return ['error' => 'No hay conexión a la base de datos.'];
    }

    $sql = "SELECT SUM(likes) AS total FROM fotografias WHERE usuario_id = ?";
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        return ['error' => 'Error en prepare: ' . $mysqli->error];
    }

    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $stmt->bind_result($total);
    $stmt->fetch();
    $stmt->close();

    return ['total' => $total ?? 0];
}

