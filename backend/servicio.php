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
$mysqli = new mysqli("localhost", "root", "", "rally_fotografico");

if ($mysqli->connect_error) {
    die("Error de conexión: " . $mysqli->connect_error);
}

// Verifica si se hace una petición GET y si es para listar archivos
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['peticion']) && $_GET['peticion'] === 'listarArchivos') {
    $imagenes = array_diff(scandir("imagenes/"), array(".", "..")); // Lee archivos de la carpeta
    echo json_encode(["imagenes" => array_values($imagenes)]);
    exit;
}

$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

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
        case "borrarUsuario":
            borrarUsuario($objeto);
            echo json_encode(listadoUsuarios());
            break;
        case "iniciarSesion":
            echo iniciarSesion($objeto->email, $objeto->password);
            break;
        case "registrarImagen":
            registrarImagen($objeto);
            echo json_encode(['success' => true, 'mensaje' => 'Imagen registrada correctamente']);
            break;
            case "listarFotosPorUsuario":
                echo json_encode(listarFotosPorUsuario($objeto->usuario_id));
                break;
        default:
            echo json_encode(['success' => false, 'error' => 'Servicio no reconocido']);
    }
}


// Métodos de usuarios (se mantienen igual)
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
    try{
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        $stm = $mysqli->prepare($sql) ->execute(
            array($objeto->nombre, $objeto->email, $objeto->password));
            return true;
    } catch (Exception $e) {
        die("Error: " . $e->getMessage());
        return false;
    }
}

function borrarUsuario($id){
    global $conn;
    try {
        $sql = "delete from usuarios where id = ?";  
        $conn->prepare($sql)->execute(array($id));
        return true;
    } catch (Exception $e) {
        die($e->getMessage());
        return false;
    }
}

function iniciarSesion($email, $password) {
    global $mysqli;
    try {
        $sql = "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 1) {
            $usuario = $res->fetch_assoc();
            if ($usuario['password'] === $password) {
                unset($usuario['password']); // Elimina la contraseña antes de devolver los datos
                return json_encode(['success' => true, 'usuario' => $usuario]);
            } else {
                return json_encode(['success' => false, 'error' => 'Contraseña incorrecta']);
            }
        } else {
            return json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        }
    } catch (Exception $e) {
        return json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

//IMAGENES

function registrarImagen($objeto){
    global $mysqli;
    try {
        $sql = "INSERT INTO fotografias (usuario_id, nombre, base64) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("iss", $objeto->usuario_id, $objeto->nombre, $objeto->base64);
        $stmt->execute();
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
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









//SERVICIO IMAGENES

// // Carpeta donde se guardan las imágenes
// $carpeta = __DIR__ . "/imagenes";

// // Lógica principal
// if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['peticion'])) {
//     switch ($_POST['peticion']) {
//         case 'crearArchivo':
//             crearArchivo($carpeta);
//             break;
//         default:
//             echo json_encode(["error" => "Operación no reconocida"]);
//             break;
//     }
// } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['peticion'])) {
//     switch ($_GET['peticion']) {
//         case 'listarArchivos':
//             listarArchivos($carpeta);
//             break;
//         default:
//             echo json_encode(["error" => "Operación no reconocida"]);
//             break;
//     }
// } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
//     parse_str(file_get_contents("php://input"), $put_vars);
//     renombrarArchivo($put_vars, $carpeta);
// } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
//     parse_str(file_get_contents("php://input"), $delete_vars);
//     eliminarArchivo($delete_vars, $carpeta);
// } else {
//     echo json_encode(["error" => "Método no permitido"]);
// }

// // Funciones
// function crearArchivo($carpeta) {
//     if (isset($_FILES['archivo'])) {
//         if (!file_exists($carpeta)) {
//             mkdir($carpeta, 0777, true);
//         }

//         $nombreOriginal = basename($_FILES['archivo']['name']);
//         $rutaDestino = $carpeta . '/' . $nombreOriginal;

//         // Validaciones
//         $tiposPermitidos = ['image/jpeg', 'image/png'];
//         if (!in_array($_FILES['archivo']['type'], $tiposPermitidos)) {
//             echo json_encode(["error" => "Tipo de archivo no permitido"]);
//             return;
//         }

//         $tamañoMaximo = 2 * 1024 * 1024; // 2 MB
//         if ($_FILES['archivo']['size'] > $tamañoMaximo) {
//             echo json_encode(["error" => "El archivo excede el tamaño permitido"]);
//             return;
//         }

//         if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
//             echo json_encode(["mensaje" => "Archivo subido con éxito", "ruta" => $rutaDestino]);
//         } else {
//             echo json_encode(["error" => "Error al guardar el archivo"]);
//         }
//     } else {
//         echo json_encode(["error" => "No se recibió un archivo"]);
//     }
// }

// function listarArchivos($carpeta) {
//     if (file_exists($carpeta)) {
//         $archivos = scandir($carpeta);
//         $imagenes = array_filter($archivos, function ($archivo) use ($carpeta) {
//             return is_file($carpeta . '/' . $archivo);
//         });
//         echo json_encode(["imagenes" => array_values($imagenes)]);
//     } else {
//         echo json_encode(["error" => "No se encontraron imágenes"]);
//     }
// }

// function renombrarArchivo($put_vars, $carpeta) {
//     if (isset($put_vars["archivoAntiguo"]) && isset($put_vars["archivoNuevo"])) {
//         $archivoAntiguo = $carpeta . '/' . $put_vars["archivoAntiguo"];
//         $archivoNuevo = $carpeta . '/' . $put_vars["archivoNuevo"];

//         if (file_exists($archivoAntiguo)) {
//             if (rename($archivoAntiguo, $archivoNuevo)) {
//                 echo json_encode(["mensaje" => "Archivo renombrado con éxito"]);
//             } else {
//                 echo json_encode(["error" => "No se pudo renombrar el archivo"]);
//             }
//         } else {
//             echo json_encode(["error" => "Archivo no encontrado"]);
//         }
//     } else {
//         echo json_encode(["error" => "Parámetros incompletos"]);
//     }
// }

// function eliminarArchivo($delete_vars, $carpeta) {
//     // Ahora se toma el parámetro 'archivo' desde la URL (no desde el cuerpo)
//     if (isset($_GET['archivo'])) {
//         $archivo = $carpeta . '/' . trim(basename($_GET['archivo']));

//         // Depuración adicional
//         error_log("Archivo recibido para eliminar: " . $_GET['archivo']);
//         error_log("Ruta construida: " . $archivo);

//         if (file_exists($archivo)) {
//             if (unlink($archivo)) {
//                 echo json_encode(["mensaje" => "Archivo eliminado con éxito"]);
//             } else {
//                 error_log("⚠️ No se pudo eliminar el archivo: " . $archivo);
//                 echo json_encode(["error" => "No se pudo eliminar el archivo"]);
//             }
//         } else {
//             error_log("❌ Archivo no encontrado: " . $archivo);
//             echo json_encode(["error" => "Archivo no encontrado"]);
//         }
//     } else {
//         error_log("❌ Parámetro 'archivo' no proporcionado");
//         echo json_encode(["error" => "Parámetro 'archivo' es requerido"]);
//     }
// }

