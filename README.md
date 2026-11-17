# Sprog 3

Application personnelle de musculation : programme modifiable, planning hebdomadaire, séances, repos, progression et mesures corporelles. Disponible comme **PWA installable** et projet **Android Capacitor**. Aucun compte, abonnement, serveur de données ou suivi publicitaire.

## Utiliser

Ouvrir **https://agassin.github.io/Sprog/**. Sur Android, choisir « Installer l’application » dans le navigateur ; sur iPhone, utiliser Safari → Partager → Sur l’écran d’accueil. Le premier chargement web doit se faire en ligne.

La version Android contient l’application et fonctionne dès le premier lancement sans réseau. Les fichiers APK de test sont disponibles dans les artefacts des exécutions réussies de [la CI](https://github.com/Agassin/Sprog/actions). Ils ne constituent pas une publication Play Store. Voir [ANDROID.md](docs/ANDROID.md).

## Fonctionnalités

- Cinq modèles de séance modifiables : noms, exercices, ordre, séries, répétitions, repos et durée indicative.
- Planning configurable sur sept jours, avec jours de repos.
- Reprise de séance, correction de série, retour à l’exercice précédent, abandon confirmé.
- Minuteur basé sur l’heure réelle et conservé après fermeture/veille. L’alarme en arrière-plan n’est pas garantie.
- Progression des charges (100 dernières observations), records et historique paginé par 20 séances.
- Suppression d’une séance de l’historique et de ses séries.
- Suivi du poids, du tour de taille et de l’énergie.
- Thèmes clair/sombre, navigation clavier, annonces et dispositions mobiles.
- Export/restauration JSON, copie avant import, effacement local et récupération des données brutes.
- Hors ligne et mises à jour web proposées hors séance.
- Sur Android : bouton Retour et partage natif du fichier de sauvegarde.

## Données et migrations

La clé historique `sprog-v1` est conservée ; le schéma interne est désormais **3**. Les schémas historiques sans numéro et la version 2 sont lus et migrés. Les exports v2 restent importables. Les noms des séances terminées sont conservés lors des modifications du programme. Renommer un exercice crée une nouvelle courbe et préserve l’ancienne.

Une sauvegarde illisible n’est pas écrasée automatiquement. Un stockage refusé ou plein déclenche un avertissement ; exporter les changements en mémoire avant de fermer. L’import validé (5 Mo maximum) remplace les données après confirmation et conserve une copie avant import, récupérable dans Réglages. Une modification détectée dans un autre onglet bloque les écritures jusqu’au rechargement.

La PWA et l’application Android ont des stockages séparés : utiliser export/import pour transférer les données. Les sauvegardes sont en clair. Voir [Confidentialité](privacy.html).

## Développement web

Node 22 ou ultérieur. L’application web source reste utilisable sans compilation :

```bash
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

Le service worker nécessite HTTPS en production (localhost est accepté). Les chemins relatifs permettent un hébergement dans `/Sprog/`.

```bash
npm ci
npm run check
npm test
npm run build
npm run test:browser
```

Le test navigateur nécessite Google Chrome (`CHROME_BIN=chromium` si nécessaire). `dist/` contient uniquement les ressources publiables. GitHub Pages utilise le dossier racine de `main` ; `.nojekyll` désactive le traitement Jekyll. Les scripts de développement ne sont pas nécessaires à l’exécution web et ne contiennent aucun secret.

## Android

```bash
npm ci
npm run android:prepare
cd android
./gradlew assembleDebug lintDebug
```

Java 21 et Android SDK 36 requis. `android/` est généré à partir de versions Capacitor verrouillées ; les personnalisations reproductibles sont dans `scripts/android.cjs`. Ne pas y effectuer des modifications manuelles destinées à être conservées sans les reporter dans ce script. Aucun keystore de production n’est inclus.

## Vérifications et publication

La CI exécute les tests Node dans deux fuseaux, les parcours Chrome à 320 px, la compilation/lint Android et un lancement sur émulateur Android. Le rapport d’audit distingue ces tests d’une recette sur téléphone physique.

Avant chaque version web, incrémenter le cache dans `sw.js`. Ne pas supprimer les données utilisateur pour appliquer une mise à jour. Après une mise à jour depuis l’ancienne version, fermer toutes les fenêtres Sprog puis rouvrir si le navigateur conserve encore l’ancien service worker.

Voir [l’audit](docs/AUDIT_MOBILE.md) et [la distribution Android](docs/ANDROID.md).
