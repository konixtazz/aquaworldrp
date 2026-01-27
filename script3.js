const listeUtilisateurs = [
    { nom: "fondateur", mdp: "tom1", role: "fondateur" },
    { nom: "Modo1", mdp: "modo", role: "staff" },
    { nom: "Helper", mdp: "help", role: "staff" }
];

const listeStaff = [
    { pseudo: "Tom", grade: "Fondateur", derniereCo: "Aujourd'hui", avertissements: 0 },
    { pseudo: "Nico", grade: "Fondateur", derniereCo: "Hier", avertissements: 0 },
    { pseudo: "Lysty", grade: "Fondateur", derniereCo: "Il y a 3 jours", avertissements: 0 },
    { pseudo: "TiiKaff", grade: "CO Fondateur", derniereCo: "Aujourd'hui", avertissements: 0 }
];

let roleUtilisateurActuel = "";

function connexion() {
    const entreeUtilisateur = document.getElementById("utilisateur").value;
    const entreeMdp = document.getElementById("motdepasse").value;
    const msgErreur = document.getElementById("msg-erreur");

    msgErreur.innerText = "";

    if (!entreeUtilisateur || !entreeMdp) {
        msgErreur.innerText = "Veuillez remplir tous les champs.";
        return;
    }

    const utilisateurTrouve = listeUtilisateurs.find(
        u => u.nom === entreeUtilisateur && u.mdp === entreeMdp
    );

    if (utilisateurTrouve) {
        roleUtilisateurActuel = utilisateurTrouve.role;

        document.getElementById("conteneur-connexion").style.opacity = "0";
        
        setTimeout(() => {
            document.getElementById("conteneur-connexion").style.display = "none";
            document.getElementById("conteneur-tableau-bord").style.display = "flex";
            document.getElementById("utilisateur-actuel").innerText = 
                utilisateurTrouve.nom + " (" + utilisateurTrouve.role + ")";
            
            chargerTableauStaff();
            demarrerHorloge();

            document.getElementById("conteneur-tableau-bord").style.opacity = "0";
            setTimeout(() => {
                document.getElementById("conteneur-tableau-bord").style.opacity = "1";
            }, 50);
        }, 300);
    } else {
        msgErreur.innerText = "Identifiant ou mot de passe incorrect.";
    }
}

function afficherSection(idSection) {
    document.getElementById("section-reglement").style.display = "none";
    document.getElementById("section-equipe").style.display = "none";
    document.getElementById("section-guide").style.display = "none";

    const itemsMenu = document.querySelectorAll(".item-menu");
    itemsMenu.forEach(item => item.classList.remove("actif"));

    document.getElementById(idSection).style.display = "block";

    event.target.closest(".item-menu").classList.add("actif");

    const titreSection = document.getElementById("titre-section");
    switch(idSection) {
        case "section-reglement":
            titreSection.innerText = "📜 Règlement Staff";
            break;
        case "section-equipe":
            titreSection.innerText = "👮 L'Équipe du Staff";
            break;
        case "section-guide":
            titreSection.innerText = "⚖️ Barème des Sanctions";
            break;
    }
}

function chargerTableauStaff() {
    const corpsTableau = document.getElementById("corps-tableau-staff");
    corpsTableau.innerHTML = "";

    const estFondateur = (roleUtilisateurActuel === 'fondateur');

    const enTetes = document.querySelectorAll(".fondateur-uniquement");
    enTetes.forEach(el => {
        el.style.display = estFondateur ? "table-cell" : "none";
    });

    const totalStaff = listeStaff.length;
    const staffActifs = listeStaff.filter(s => 
        s.derniereCo === "Aujourd'hui" || s.derniereCo === "Hier"
    ).length;

    const totalElement = document.getElementById("total-staff");
    const actifsElement = document.getElementById("staff-actifs");
    
    if (totalElement) totalElement.innerText = totalStaff;
    if (actifsElement) actifsElement.innerText = staffActifs;

    listeStaff.forEach((staff, index) => {
        let ligne = document.createElement('tr');
        ligne.style.animationDelay = (index * 0.05) + 's';

        let badgeGrade = getBadgeGrade(staff.grade);

        let indicateurCo = getIndicateurConnexion(staff.derniereCo);
        
        ligne.innerHTML = `
            <td><strong>${staff.pseudo}</strong></td>
            <td>${badgeGrade}</td>
            <td>${indicateurCo} ${staff.derniereCo}</td>
        `;

        if (estFondateur) {
            let celluleAvertissements = document.createElement('td');
            celluleAvertissements.className = 'fondateur-uniquement';
            celluleAvertissements.style.display = 'table-cell';
            celluleAvertissements.innerHTML = getBadgeAvertissement(staff.avertissements);
            ligne.appendChild(celluleAvertissements);
        }

        corpsTableau.appendChild(ligne);
    });
}

function getBadgeGrade(grade) {
    const couleurs = {
        'Fondateur': 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
        'CO Fondateur': 'background: rgba(245, 158, 11, 0.2); color: #f59e0b;',
        'Administrateur': 'background: rgba(99, 102, 241, 0.2); color: #6366f1;',
        'Modérateur': 'background: rgba(16, 185, 129, 0.2); color: #10b981;'
    };
    
    const style = couleurs[grade] || 'background: rgba(148, 163, 184, 0.2); color: #94a3b8;';
    return `<span style="padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; ${style}">${grade}</span>`;
}

function getIndicateurConnexion(derniereCo) {
    if (derniereCo === "Aujourd'hui") {
        return '<span style="color: #10b981;">●</span>';
    } else if (derniereCo === "Hier") {
        return '<span style="color: #f59e0b;">●</span>';
    } else {
        return '<span style="color: #ef4444;">●</span>';
    }
}

function getBadgeAvertissement(nombre) {
    let couleur = '#10b981'; // Vert
    if (nombre === 1) couleur = '#f59e0b';
    if (nombre >= 2) couleur = '#ef4444';
    
    return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(${nombre >= 2 ? '239, 68, 68' : nombre === 1 ? '245, 158, 11' : '16, 185, 129'}, 0.2); color: ${couleur}; font-weight: 700; font-size: 14px;">${nombre}</span>`;
}

function demarrerHorloge() {
    function mettreAJourHorloge() {
        const maintenant = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const horloge = document.getElementById("horloge");
        if (horloge) {
            horloge.innerText = maintenant.toLocaleDateString('fr-FR', options);
        }
    }
    
    mettreAJourHorloge();
    setInterval(mettreAJourHorloge, 60000);
}

function deconnexion() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        document.getElementById("conteneur-tableau-bord").style.opacity = "0";
        setTimeout(() => {
            location.reload();
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const champMotDePasse = document.getElementById("motdepasse");
    const champUtilisateur = document.getElementById("utilisateur");
    
    if (champMotDePasse) {
        champMotDePasse.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                connexion();
            }
        });
    }
    
    if (champUtilisateur) {
        champUtilisateur.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                document.getElementById("motdepasse").focus();
            }
        });
    }

    const conteneurConnexion = document.getElementById("conteneur-connexion");
    if (conteneurConnexion) {
        conteneurConnexion.style.transition = "opacity 0.3s ease";
    }

    const conteneurTableauBord = document.getElementById("conteneur-tableau-bord");
    if (conteneurTableauBord) {
        conteneurTableauBord.style.transition = "opacity 0.3s ease";
    }
});