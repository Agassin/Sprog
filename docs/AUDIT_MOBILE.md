# Audit mobile — Sprog 3, 17 novembre 2026

Périmètre : Agassin/Sprog. Le dépôt Sprog-2.0 est distinct et n’a pas été modifié.

## Produit livré

Application personnelle de musculation, utilisable sans compte : PWA installable et application Android embarquant les mêmes écrans. Programme et planning personnalisables, progression et données locales. La synchronisation cloud et les services payants n’ont pas été ajoutés : le transfert explicite par sauvegarde évite d’imposer un backend et un compte à cet usage.

## Corrections et compléments

| Critère | État dans cette version |
|---|---|
| Saisie | Validation des nombres, bornes, décimales françaises et erreurs visibles |
| Injection HTML | Texte utilisateur échappé, validation des imports et exclusion des clés de prototype |
| Migration | Données d’origine et exports v2 compatibles avec le schéma 3 |
| Stockage | Erreurs de quota/refus signalées ; stockage corrompu préservé ; conflit entre onglets détecté |
| Sauvegarde | Export, import validé, copie avant import, restauration et effacement |
| Programme | Cinq modèles éditables, ajout/suppression/réorganisation des exercices, planning sur sept jours |
| Séance | Reprise, correction d’une série, navigation entre exercices et abandon confirmé |
| Repos | Échéance absolue conservée ; recalcul à la reprise après veille |
| Historique | Détail, suppression et pagination par 20 ; anciens noms de séance préservés |
| Progression | Courbes bornées aux 100 dernières observations pour limiter le rendu |
| Interface | Thèmes clair/sombre, focus visible, annonces, petits écrans et zones sûres |
| Hors ligne | Cache cohérent versionné ; mise à jour web hors séance |
| Confidentialité | Page accessible hors ligne ; aucune télémétrie ; exports en clair explicités |
| Android | Projet généré reproductiblement, ressources embarquées, partage de sauvegarde et bouton Retour |
| Dépendances | Versions verrouillées ; audit npm des dépendances de production sans vulnérabilité signalée lors de la préparation |
| Publication | GitHub Pages pour la PWA ; APK de test via les artefacts GitHub Actions |

## Validation

La CI du commit concerné est la référence pour les résultats effectifs. Elle comprend :

- Vérification syntaxique et tests de logique/import/migration/cache dans Europe/Paris et America/New_York.
- Chrome headless à 320 px : écrans, saisies réelles, personnalisation, échappement HTML, thème, rechargement après arrêt du serveur et confidentialité hors ligne.
- Compilation `assembleDebug`, analyse `lintDebug`, installation et démarrage sur émulateur Android API 35.

Ces contrôles ne valent pas recette exhaustive sur téléphone physique et ne certifient ni Safari, ni TalkBack/VoiceOver, ni l’acceptation par un store. Aucun score Lighthouse n’est revendiqué.

## Recette sur appareil

1. Importer une copie des données existantes, vérifier séances, courbes et mesures.
2. Modifier une séance et son planning ; fermer et rouvrir ; vérifier la persistance.
3. Valider une série, verrouiller au-delà du repos, revenir : afficher 00:00.
4. Fermer pendant une séance, relancer hors ligne et reprendre.
5. Exporter depuis Android vers un emplacement choisi ; importer ce fichier dans la PWA puis vérifier les données.
6. Restaurer la copie avant import ; refuser un JSON invalide sans remplacer les données.
7. Vérifier clavier, navigation au lecteur d’écran, taille du texte et bouton Retour.
8. Effacer les données Sprog ; supprimer séparément les fichiers exportés conservés ailleurs.

## Limites explicites

- Pas de compte, synchronisation cloud ni récupération distante : conserver ses exports.
- Pas d’alarme garantie lorsque l’application est suspendue ou fermée.
- L’APK est une version de test avec signature de débogage ; lire [ANDROID.md](ANDROID.md) avant installation ou remplacement.
- Publication Play Store : compte éditeur, identité, déclarations et signature de production restent nécessaires. Aucun compte n’a été créé et aucune identité inventée.
- iPhone : PWA ; aucun binaire iOS signé fourni.
- Avant une diffusion commerciale : compléter le contact privé et les informations de l’éditeur et faire vérifier les obligations correspondant au produit et à son hébergement.
