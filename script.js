const utilisateursAutorises = {
  tom: {
    motDePasse: "dev1",
    nom: "Tom",
    role: "dev",
  },
  moderateur: {
    motDePasse: "fonda1",
    nom: "Nico",
    role: "Fondateur",
  },
  dev: {
    motDePasse: "dev123",
    nom: "Développeur",
    role: "developpeur",
  },
};

let utilisateurConnecte = null;

function verifierConnexion() {
  const sessionUtilisateur = localStorage.getItem("utilisateurConnecte");
  if (sessionUtilisateur) {
    try {
      utilisateurConnecte = JSON.parse(sessionUtilisateur);
      afficherApplication();
    } catch (e) {
      localStorage.removeItem("utilisateurConnecte");
    }
  }
}

document
  .getElementById("formulaireConnexion")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const identifiant = document
      .getElementById("identifiantConnexion")
      .value.trim();
    const motDePasse = document.getElementById("motDePasseConnexion").value;

    if (
      utilisateursAutorises[identifiant] &&
      utilisateursAutorises[identifiant].motDePasse === motDePasse
    ) {
      utilisateurConnecte = {
        identifiant: identifiant,
        nom: utilisateursAutorises[identifiant].nom,
        role: utilisateursAutorises[identifiant].role,
      };

      localStorage.setItem(
        "utilisateurConnecte",
        JSON.stringify(utilisateurConnecte),
      );

      afficherApplication();

      document.getElementById("formulaireConnexion").reset();
      document.getElementById("messageErreur").classList.remove("visible");
    } else {
      afficherErreurConnexion();
    }
  });

function afficherErreurConnexion() {
  const messageErreur = document.getElementById("messageErreur");
  messageErreur.classList.add("visible");

  document.getElementById("identifiantConnexion").style.animation =
    "trembler 0.5s ease";
  document.getElementById("motDePasseConnexion").style.animation =
    "trembler 0.5s ease";

  setTimeout(() => {
    document.getElementById("identifiantConnexion").style.animation = "";
    document.getElementById("motDePasseConnexion").style.animation = "";
  }, 500);
}

function afficherApplication() {
  document.getElementById("conteneurConnexion").classList.add("cache");

  document.getElementById("applicationPrincipale").style.display = "block";

  const nomUtilisateur = utilisateurConnecte.nom;
  const initiale = nomUtilisateur.charAt(0).toUpperCase();

  document.getElementById("nomUtilisateur").textContent = nomUtilisateur;
  document.getElementById("avatarUtilisateur").textContent = initiale;

  afficherTableau();
  mettreAJourStatistiques();

  afficherToast(`Bienvenue ${nomUtilisateur} ! 👋`);
}

function seDeconnecter() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    localStorage.removeItem("utilisateurConnecte");
    utilisateurConnecte = null;

    document.getElementById("applicationPrincipale").style.display = "none";

    document.getElementById("conteneurConnexion").classList.remove("cache");

    document.getElementById("formulaireConnexion").reset();
    document.getElementById("messageErreur").classList.remove("visible");

    afficherToast("Déconnexion réussie ! 👋", "succes");
  }
}

let taches = JSON.parse(localStorage.getItem("fivemTaches")) || [];
let filtres = {
  types: [],
  recherche: "",
};
let idTacheEnEdition = null;

document.addEventListener("DOMContentLoaded", () => {
  verifierConnexion();
});

document.getElementById("formulaireTache").addEventListener("submit", (e) => {
  e.preventDefault();
  if (idTacheEnEdition) {
    mettreAJourTache();
  } else {
    ajouterTache();
  }
});

function sauvegarderTaches() {
  localStorage.setItem("fivemTaches", JSON.stringify(taches));
  afficherTableau();
  mettreAJourStatistiques();
}

function afficherTableau() {
  ["aFaire", "enCours", "testing", "termine"].forEach((statut) => {
    const liste = document.getElementById(
      `liste${statut.charAt(0).toUpperCase() + statut.slice(1)}`,
    );
    liste.innerHTML = "";

    const tachesFiltrees = obtenirTachesFiltrees().filter(
      (t) => t.statut === statut,
    );
    document.getElementById(
      `compteur${statut.charAt(0).toUpperCase() + statut.slice(1)}`,
    ).innerText = tachesFiltrees.length;

    tachesFiltrees.forEach((tache) => {
      liste.appendChild(creerCarteTache(tache));
    });
  });
}

function creerCarteTache(tache) {
  const carte = document.createElement("div");
  carte.className = "carte-tache";
  carte.draggable = true;
  carte.id = tache.id;
  carte.ondragstart = glisser;
  carte.ondragend = (e) => e.target.classList.remove("enDeplacement");

  const classePriorite = `priorite-${tache.priorite || "moyenne"}`;
  const iconePriorite =
    tache.priorite === "haute"
      ? "🔴"
      : tache.priorite === "basse"
        ? "🟢"
        : "🟡";

  let htmlDateLimite = "";
  if (tache.dateLimite) {
    const dateLimite = new Date(tache.dateLimite);
    const aujourdhui = new Date();
    const estEnRetard = dateLimite < aujourdhui && tache.statut !== "termine";
    const dateFormatee = dateLimite.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    htmlDateLimite = `<span class="date-tache ${estEnRetard ? "enRetard" : ""}">📅 ${dateFormatee}</span>`;
  }

  carte.innerHTML = `
                <div class="entete-tache">
                    <div class="tags-tache">
                        <span class="tag-tache tag-${tache.type}">${tache.type}</span>
                    </div>
                    <div class="actions-tache">
                        <button class="bouton-action-tache" onclick="editerTache(${tache.id})" title="Éditer">✏️</button>
                        <button class="bouton-action-tache supprimer" onclick="supprimerTache(${tache.id})" title="Supprimer">🗑️</button>
                    </div>
                </div>
                <div class="titre-tache">${tache.titre}</div>
                <div class="description-tache">${tache.description || "Pas de description"}</div>
                <div class="pied-tache">
                    <span class="priorite-tache ${classePriorite}">${iconePriorite} ${obtenirLabelPriorite(tache.priorite)}</span>
                    ${htmlDateLimite}
                </div>
            `;

  return carte;
}

function obtenirLabelPriorite(priorite) {
  const labels = { haute: "Haute", moyenne: "Moyenne", basse: "Basse" };
  return labels[priorite] || "Moyenne";
}

function ajouterTache() {
  const titre = document.getElementById("titreTache").value.trim();
  const type = document.getElementById("typeTache").value;
  const priorite = document.getElementById("prioriteTache").value;
  const dateLimite = document.getElementById("dateLimiteTache").value;
  const description = document.getElementById("descriptionTache").value.trim();

  if (!titre) {
    afficherToast("Le titre est obligatoire !", "erreur");
    return;
  }

  const nouvelleTache = {
    id: Date.now(),
    titre,
    type,
    priorite,
    dateLimite,
    description,
    statut: "aFaire",
    dateCreation: new Date().toISOString(),
  };

  taches.push(nouvelleTache);
  sauvegarderTaches();
  fermerModale();
  afficherToast("Tâche créée avec succès ! 🎉");
}

function editerTache(id) {
  const tache = taches.find((t) => t.id === id);
  if (!tache) return;

  idTacheEnEdition = id;
  document.getElementById("titreModale").textContent = "Modifier la tâche";
  document.getElementById("boutonSoumettre").textContent = "Mettre à jour";
  document.getElementById("titreTache").value = tache.titre;
  document.getElementById("typeTache").value = tache.type;
  document.getElementById("prioriteTache").value = tache.priorite || "moyenne";
  document.getElementById("dateLimiteTache").value = tache.dateLimite || "";
  document.getElementById("descriptionTache").value = tache.description || "";

  ouvrirModale();
}

function mettreAJourTache() {
  const tache = taches.find((t) => t.id === idTacheEnEdition);
  if (!tache) return;

  tache.titre = document.getElementById("titreTache").value.trim();
  tache.type = document.getElementById("typeTache").value;
  tache.priorite = document.getElementById("prioriteTache").value;
  tache.dateLimite = document.getElementById("dateLimiteTache").value;
  tache.description = document.getElementById("descriptionTache").value.trim();

  sauvegarderTaches();
  fermerModale();
  afficherToast("Tâche mise à jour ! ✅");
}

function supprimerTache(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    taches = taches.filter((t) => t.id !== id);
    sauvegarderTaches();
    afficherToast("Tâche supprimée", "erreur");
  }
}

function ouvrirModale() {
  document.getElementById("modale").classList.add("active");
}

function fermerModale() {
  document.getElementById("modale").classList.remove("active");
  document.getElementById("formulaireTache").reset();
  document.getElementById("titreModale").textContent = "Nouvelle Tâche";
  document.getElementById("boutonSoumettre").textContent = "Créer la tâche";
  idTacheEnEdition = null;
}

function autoriserDepot(ev) {
  ev.preventDefault();
}

function glisser(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  ev.target.classList.add("enDeplacement");
}

function deposer(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const tacheDeplacee = taches.find((t) => t.id == data);

  let cible = ev.target;
  while (!cible.classList.contains("colonne") && cible.parentElement) {
    cible = cible.parentElement;
  }

  if (cible.classList.contains("colonne")) {
    const nouveauStatut = cible.getAttribute("data-statut");
    if (tacheDeplacee.statut !== nouveauStatut) {
      tacheDeplacee.statut = nouveauStatut;
      sauvegarderTaches();
      afficherToast(
        `Tâche déplacée vers ${obtenirLabelStatut(nouveauStatut)} 🚀`,
      );
    }
  }
}

function obtenirLabelStatut(statut) {
  const labels = {
    aFaire: "À faire",
    enCours: "En développement",
    testing: "Testing",
    termine: "Terminées",
  };
  return labels[statut] || statut;
}

function basculerFiltre(type) {
  const index = filtres.types.indexOf(type);
  const boutonFiltre = document.querySelector(
    `.tag-filtre[data-type="${type}"]`,
  );

  if (index > -1) {
    filtres.types.splice(index, 1);
    boutonFiltre.classList.remove("actif");
  } else {
    filtres.types.push(type);
    boutonFiltre.classList.add("actif");
  }

  afficherTableau();
}

function filtrerTaches() {
  filtres.recherche = document
    .getElementById("boiteRecherche")
    .value.toLowerCase();
  afficherTableau();
}

function obtenirTachesFiltrees() {
  return taches.filter((tache) => {
    const correspondType =
      filtres.types.length === 0 || filtres.types.includes(tache.type);
    const correspondRecherche =
      !filtres.recherche ||
      tache.titre.toLowerCase().includes(filtres.recherche) ||
      (tache.description &&
        tache.description.toLowerCase().includes(filtres.recherche));
    return correspondType && correspondRecherche;
  });
}

function mettreAJourStatistiques() {
  const total = taches.length;
  const terminees = taches.filter((t) => t.statut === "termine").length;
  const progres = total > 0 ? Math.round((terminees / total) * 100) : 0;

  document.getElementById("totalTaches").textContent =
    `${total} tâche${total > 1 ? "s" : ""}`;
  document.getElementById("pourcentageProgres").textContent =
    `${progres}% complété`;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statTerminees").textContent = terminees;
  document.getElementById("statEnCours").textContent = taches.filter(
    (t) => t.statut === "enCours",
  ).length;

  const enRetard = taches.filter((t) => {
    if (!t.dateLimite || t.statut === "termine") return false;
    return new Date(t.dateLimite) < new Date();
  }).length;
  document.getElementById("statEnRetard").textContent = enRetard;
}

function basculerStatistiques() {
  const panneau = document.getElementById("panneauStats");
  panneau.style.display = panneau.style.display === "none" ? "block" : "none";
}

function afficherToast(message, type = "succes") {
  const conteneur = document.getElementById("conteneurToast");
  const toast = document.createElement("div");
  toast.className = `notification-toast ${type}`;
  toast.innerHTML = `
                <span style="font-size: 1.2rem;">${type === "erreur" ? "❌" : "✅"}</span>
                <span>${message}</span>
            `;

  conteneur.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "apparitionFondu 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("modale").classList.contains("active")
  ) {
    fermerModale();
  }
});
