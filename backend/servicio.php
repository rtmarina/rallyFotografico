<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Conexión a la base de datos
$mysqli = new mysqli("localhost", "root", "", "rally_fotografico");

if ($mysqli->connect_error) {
    die("Error de conexión: " . $mysqli->connect_error);
}

//SERVICIO IMAGENES

// Carpeta donde se guardan las imágenes
$carpeta = __DIR__ . "/imagenes";

// Lógica principal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['peticion'])) {
    switch ($_POST['peticion']) {
        case 'crearUsuario':
            crearUsuario($mysqli);
            break;
        case 'crearArchivo':
            crearArchivo($carpeta);
            break;
        default:
            echo json_encode(["error" => "Operación no reconocida"]);
            break;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['peticion'])) {
    switch ($_GET['peticion']) {
        case 'listarArchivos':
            listarArchivos($carpeta);
            break;
        default:
            echo json_encode(["error" => "Operación no reconocida"]);
            break;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $put_vars);
    renombrarArchivo($put_vars, $carpeta);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $delete_vars);
    eliminarArchivo($delete_vars, $carpeta);
} else {
    echo json_encode(["error" => "Método no permitido"]);
}

// Funciones
function crearArchivo($carpeta) {
    if (isset($_FILES['archivo'])) {
        if (!file_exists($carpeta)) {
            mkdir($carpeta, 0777, true);
        }

        $nombreOriginal = basename($_FILES['archivo']['name']);
        $rutaDestino = $carpeta . '/' . $nombreOriginal;

        // Validaciones
        $tiposPermitidos = ['image/jpeg', 'image/png'];
        if (!in_array($_FILES['archivo']['type'], $tiposPermitidos)) {
            echo json_encode(["error" => "Tipo de archivo no permitido"]);
            return;
        }

        $tamañoMaximo = 2 * 1024 * 1024; // 2 MB
        if ($_FILES['archivo']['size'] > $tamañoMaximo) {
            echo json_encode(["error" => "El archivo excede el tamaño permitido"]);
            return;
        }

        if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
            echo json_encode(["mensaje" => "Archivo subido con éxito", "ruta" => $rutaDestino]);
        } else {
            echo json_encode(["error" => "Error al guardar el archivo"]);
        }
    } else {
        echo json_encode(["error" => "No se recibió un archivo"]);
    }
}

function listarArchivos($carpeta) {
    if (file_exists($carpeta)) {
        $archivos = scandir($carpeta);
        $imagenes = array_filter($archivos, function ($archivo) use ($carpeta) {
            return is_file($carpeta . '/' . $archivo);
        });
        echo json_encode(["imagenes" => array_values($imagenes)]);
    } else {
        echo json_encode(["error" => "No se encontraron imágenes"]);
    }
}

function renombrarArchivo($put_vars, $carpeta) {
    if (isset($put_vars["archivoAntiguo"]) && isset($put_vars["archivoNuevo"])) {
        $archivoAntiguo = $carpeta . '/' . $put_vars["archivoAntiguo"];
        $archivoNuevo = $carpeta . '/' . $put_vars["archivoNuevo"];

        if (file_exists($archivoAntiguo)) {
            if (rename($archivoAntiguo, $archivoNuevo)) {
                echo json_encode(["mensaje" => "Archivo renombrado con éxito"]);
            } else {
                echo json_encode(["error" => "No se pudo renombrar el archivo"]);
            }
        } else {
            echo json_encode(["error" => "Archivo no encontrado"]);
        }
    } else {
        echo json_encode(["error" => "Parámetros incompletos"]);
    }
}

function eliminarArchivo($delete_vars, $carpeta) {
    // Ahora se toma el parámetro 'archivo' desde la URL (no desde el cuerpo)
    if (isset($_GET['archivo'])) {
        $archivo = $carpeta . '/' . trim(basename($_GET['archivo']));

        // Depuración adicional
        error_log("Archivo recibido para eliminar: " . $_GET['archivo']);
        error_log("Ruta construida: " . $archivo);

        if (file_exists($archivo)) {
            if (unlink($archivo)) {
                echo json_encode(["mensaje" => "Archivo eliminado con éxito"]);
            } else {
                error_log("⚠️ No se pudo eliminar el archivo: " . $archivo);
                echo json_encode(["error" => "No se pudo eliminar el archivo"]);
            }
        } else {
            error_log("❌ Archivo no encontrado: " . $archivo);
            echo json_encode(["error" => "Archivo no encontrado"]);
        }
    } else {
        error_log("❌ Parámetro 'archivo' no proporcionado");
        echo json_encode(["error" => "Parámetro 'archivo' es requerido"]);
    }
}
// Función para crear un usuario
function crearUsuario($mysqli) {
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['nombre'], $data['email'], $data['password'])) {
        $nombre = $mysqli->real_escape_string($data['nombre']);
        $email = $mysqli->real_escape_string($data['email']);
        $password = password_hash($data['contraseña'], PASSWORD_DEFAULT); // Asegúrate de hashear la contraseña

        // Crear la consulta SQL para insertar el nuevo usuario
        $query = "INSERT INTO usuarios (nombre, email, contraseña, fecha_registro, rol) VALUES ('$nombre', '$email', '$password', NOW(), 'participante')";
        
        if ($mysqli->query($query) === TRUE) {
            echo json_encode(["mensaje" => "Usuario registrado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al registrar el usuario", "detalle" => $mysqli->error]);
        }
    } else {
        echo json_encode(["error" => "Faltan datos en la solicitud"]);
    }
}
