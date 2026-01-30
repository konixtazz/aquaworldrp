<?php
// verify.php

// --- CONFIGURATION ---
$secret_token = "MonSuperSecretToken123"; // Change ceci par un mot de passe unique
$allowed_ips = [
    '45.95.113.119',      // Localhost (pour tes tests)
    '192.168.18.202'
];
// ---------------------

// 1. Sécurité : Vérifier le Token (Header)
// Cela empêche quelqu'un d'accéder au lien via un navigateur web classique
$headers = getallheaders();
$client_token = isset($headers['X-Script-Secret']) ? $headers['X-Script-Secret'] : '';

if ($client_token !== $secret_token) {
    http_response_code(403);
    die("-- Accès refusé : Token invalide.");
}

// 2. Sécurité : Vérifier l'IP
// Gestion des IP derrière Cloudflare ou Proxy
$user_ip = $_SERVER['REMOTE_ADDR'];
if (isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
    $user_ip = $_SERVER["HTTP_CF_CONNECTING_IP"];
}

if (!in_array($user_ip, $allowed_ips)) {
    http_response_code(401);
    die("-- Accès refusé : IP non autorisée (" . $user_ip . ")");
}

// 3. LE CODE SOURCE PROTÉGÉ
// On utilise la syntaxe HEREDOC (<<<LUA) pour mettre ton code proprement
// Note : J'ai gardé ton code exact. Assure-toi que Config.Items est bien chargé côté client avant ce script.

$payload = <<<LUA
print("^2[SECURE] Authentification réussie. Chargement du Blackmarket...^7")

local GlobalStock = Config.Items

ESX.RegisterServerCallback('blackmarket:getData', function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)
    local blackMoney = xPlayer.getAccount('black_money').money
    
    cb(GlobalStock, blackMoney)
end)

ESX.RegisterServerCallback('blackmarket:buyItem', function(source, cb, itemName)
    local xPlayer = ESX.GetPlayerFromId(source)
    local itemData = nil
    local itemIndex = 0

    for i, v in ipairs(GlobalStock) do
        if v.name == itemName then
            itemData = v
            itemIndex = i
            break
        end
    end

    if not itemData then return cb(false, "Item invalide") end

    if itemData.stock <= 0 then
        return cb(false, "Rupture de stock")
    end

    local price = itemData.price
    
    if xPlayer.getAccount('black_money').money >= price then
        if xPlayer.canCarryItem(itemName, 1) then
            xPlayer.removeAccountMoney('black_money', price)
            xPlayer.addInventoryItem(itemName, 1)
            
            GlobalStock[itemIndex].stock = GlobalStock[itemIndex].stock - 1
            
            cb(true, price)
        else
            cb(false, "Pas assez de place")
        end
    else
        cb(false, "Pas assez d'argent sale")
    end
end)
LUA;

// 4. Envoi du code
echo $payload;
?>
