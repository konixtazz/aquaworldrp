function copierIP() {
  const texteIP = document.getElementById("ip-serveur").innerText;

  navigator.clipboard
    .writeText(texteIP)
    .then(() => {
      alert(
        "IP copiée : " + texteIP + " ! Ouvre ton jeu (F8) et connecte-toi.",
      );
    })
    .catch((erreur) => {
      console.error("Erreur lors de la copie :", erreur);
    });
}
