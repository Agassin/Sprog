# Sprog

Application web mobile installable (PWA) de suivi d’un programme de musculation : cinq séances par semaine, cycles de douze semaines, séries, repos, progression et mesures corporelles. Interface française, HTML/CSS/JavaScript sans dépendance de production et sans compilation.

## Fonctionnalités

- Programme hebdomadaire et reprise de séance après fermeture.
- Charges et répétitions validées, correction de la dernière série, retour à l’exercice précédent.
- Repos sauvegardé sous forme d’échéance : le temps restant est recalculé après veille. Pas d’alarme garantie lorsque l’application est suspendue ou fermée.
- Courbes de charge, records et historique détaillé des séances.
- Suivi hebdomadaire du poids, du tour de taille et de l’énergie.
- Réglages : installation, export JSON, import validé, copie avant import, récupération et effacement des données.
- Mode hors ligne après chargement complet initial. Mise à jour proposée et appliquée hors séance.
- Stockage défaillant ou corrompu signalé, données illisibles préservées.
- Navigation clavier, annonces accessibles, focus visible, zones sûres et petits écrans.

## Démarrer

Servir le dossier depuis un serveur HTTP local, par exemple :

```bash
python3 -m http.server 8000
```

Ouvrir http://localhost:8000. Le service worker nécessite HTTPS en production (localhost est accepté en développement). Ne pas ouvrir directement index.html en file://.

Pour GitHub Pages : sélectionner la branche voulue dans les paramètres Pages. Les URL relatives prennent en charge le sous-dossier /Sprog/. Cette documentation ne signifie pas qu’un déploiement a été réalisé.

## Installer

- Android : ouvrir le site dans un navigateur compatible et choisir Installer dans son menu ou dans Réglages si le bouton est disponible.
- iPhone/iPad : Safari → Partager → Sur l’écran d’accueil.
- Charger complètement l’application en ligne avant son premier usage hors ligne.

Sprog est une PWA, pas un binaire Android/iOS publié dans un store.

## Données

Le stockage principal conserve la clé historique `sprog-v1`, avec un schéma interne version 2. Les données de l’ancienne version sont validées et migrées en mémoire ; aucune suppression automatique de données corrompues n’est effectuée.

Exporter régulièrement depuis Réglages. Une sauvegarde JSON contient des données personnelles en clair. L’import remplace les données après confirmation et conserve la version précédemment enregistrée dans `sprog-v1-avant-import`. Cette copie est récupérable dans Réglages. L’export brut sert à récupérer un stockage devenu illisible. Un import doit être valide et inférieur ou égal à 5 Mo.

Une erreur de quota ou un stockage refusé déclenche un avertissement : ne pas fermer avant d’exporter les changements en mémoire. Une modification détectée dans un autre onglet bloque les nouvelles écritures jusqu’au rechargement, pour éviter un écrasement silencieux.

Il n’y a pas de compte, synchronisation cloud, sauvegarde distante automatique ni télémétrie. Voir [Confidentialité](privacy.html).

## Vérifier

Node.js 22 ou ultérieur ; aucune installation npm nécessaire :

```bash
npm run check
npm test
```

La CI exécute ces commandes avec les fuseaux Europe/Paris et America/New_York. Les tests couvrent la validation, la migration, le stockage, les actions de séance, le minuteur, l’import et le service worker. Le faux DOM des tests de logique ne remplace pas un navigateur ou un téléphone.

Voir [l’audit et la recette mobile](docs/AUDIT_MOBILE.md) avant publication.

## Structure

| Fichier | Rôle |
|---|---|
| program.js | Programme sportif fixe |
| data.js | Validation, migration, dates et calcul du repos |
| app.js | Écrans, actions, sauvegardes et installation |
| style.css | Apparence responsive et accessibilité |
| sw.js | Cache versionné des ressources de l’application |
| manifest.webmanifest | Identité et installation PWA |
| privacy.html | Informations sur le traitement des données |
| tests/ | Tests sans dépendance |
| .github/workflows/ci.yml | Vérifications automatiques |

Pour chaque modification d’une ressource, incrémenter la version du cache dans sw.js et garder sa liste de fichiers à jour. Les ressources d’une version sont conservées ensemble pour éviter de mélanger plusieurs versions de scripts.
