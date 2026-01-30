<?php
header('Content-Type: application/json');

// Ta liste de licences autorisées (ou connecte ça à une base de données SQL)
$allowed_licenses = [
    "",
];

// Récupérer la licence envoyée par le script FiveM
$license_check = $_GET['license'] ?? '';

if (in_array($license_check, $allowed_licenses)) {
    // Si la licence est dans la liste
    echo json_encode(["status" => "AUTHORIZED", "token" => md5(time())]);
} else {
    // Si la licence n'est pas connue
    echo json_encode(["status" => "DENIED"]);
}
?>
