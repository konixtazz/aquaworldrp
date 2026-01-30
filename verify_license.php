<?php
// api.php

// On indique qu'on renvoie du JSON
header('Content-Type: application/json');

// On récupère les données envoyées par le serveur FiveM
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Données reçues (pour test)
$scriptName = $data['script'] ?? '';
$licenseKey = $data['license'] ?? '';

// --- CONFIGURATION DE TEST ---
// Dans un vrai système, tu vérifierais cela dans une base de données SQL
$validKeys = [
    "cfxk_1l9StJQJTHYtAZr1KRGop_3T2XHr" => true,
];

// Vérification
if (isset($validKeys[$licenseKey])) {
    // SUCCES : On renvoie "authorized"
    echo json_encode(["status" => "authorized"]);
} else {
    // ECHEC : On renvoie "unauthorized"
    echo json_encode(["status" => "unauthorized", "message" => "Clé invalide"]);
}
?>
