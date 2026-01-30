<?php
// verify.php

// 1. Liste des IPs autorisées (Vos clients)
$allowed_ips = [
    '192.168.18.202',
];

// 2. Récupérer l'IP du visiteur
// Note : Si vous utilisez Cloudflare, utilisez $_SERVER["HTTP_CF_CONNECTING_IP"]
$user_ip = $_SERVER['REMOTE_ADDR'];

// 3. Le code SECRET de votre script FiveM (Exemple simple)
// Dans la réalité, ce code peut faire des milliers de lignes.
$secret_code = '
    print("^2[SUCCESS] Script authentifié avec succès !^7")
    RegisterCommand("monscript", function()
        print("Le script exclusif fonctionne !")
    end)
';

// 4. Vérification
if (in_array($user_ip, $allowed_ips)) {
    // Si l'IP est bonne, on affiche le code Lua
    echo $secret_code;
} else {
    // Si l'IP est mauvaise, on envoie un leurre ou une erreur
    http_response_code(403);
    echo 'print("^1[ERROR] IP Non autorisée : ' . $user_ip . '^7")';
}
?>
