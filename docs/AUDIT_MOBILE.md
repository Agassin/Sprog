# Audit mobile — 16 novembre 2026

Périmètre : Agassin/Sprog, base 833ea7120cb26cf9ef04907b465b774532b2d078. Le dépôt Sprog-2.0 est distinct et n’a pas été modifié.

## Conclusion

La version initiale était un prototype PWA fonctionnel mais insuffisamment protégé contre les erreurs de saisie et de stockage. Cette branche renforce une application personnelle, locale et utilisable hors ligne. Elle ne constitue pas une certification de publication mobile ou de conformité juridique. Il n’existe pas de liste universelle imposant comptes, achats ou notifications à toutes les applications.

## État des principaux critères

| Critère | Constat initial | Traitement dans cette branche / limite |
|---|---|---|
| Programme et séances | Présents | Conservés ; correction de série et retour à l’exercice précédent ajoutés |
| Saisies | parseFloat/parseInt acceptaient des valeurs partielles ou négatives | Validation bornée ; messages d’erreur ; décimales françaises |
| Injection HTML | Saisies interpolées dans des attributs sans échappement | Échappement des brouillons, validation des sauvegardes, CSP dans le document principal |
| Données enregistrées | JSON sans validation de structure | Schéma validé, migration de l’ancien format et préservation du stockage illisible |
| Quota / stockage refusé | Exceptions non gérées | Avertissement persistant, export des changements en mémoire |
| Plusieurs onglets | Risque d’écrasement silencieux | Blocage des écritures après événement de changement externe ; pas de synchronisation collaborative |
| Repos et veille | Décrément d’un compteur en mémoire | Échéance absolue sauvegardée, reprise après suspension/rechargement |
| Historique | Courbe seulement | Détail des séances et séries consultable |
| Sauvegarde et portabilité | Absentes | Export, import contrôlé jusqu’à 5 Mo, copie avant import et restauration |
| Effacement | Absent de l’interface | Effacement confirmé du stockage Sprog et de ses copies locales |
| Confidentialité | Peu expliquée | Page dédiée ; limites du stockage local et exports en clair expliquées |
| Hors ligne | Cache mélangeant potentiellement des versions | Cache cohérent par version ; requêtes limitées aux ressources de Sprog |
| Caches des autres applications | Suppression de tous les autres caches | Nettoyage limité aux caches portant le nom historique de Sprog |
| Mise à jour | Pas d’interface dédiée | Proposition explicite et activation hors séance |
| Installation | Manifeste minimal | Identité/scope relatifs, aide Android/iOS, invitation si supportée |
| Accessibilité | Partielle | Navigation identifiée, focus, annonces, lien d’évitement, cibles tactiles |
| Tests / CI | Absents | Tests de logique et du service worker ; CI Node 22 dans deux fuseaux |
| Application native / stores | Absente | Non réalisée ; nécessite choix de distribution, packaging, signature et comptes éditeur |
| Synchronisation multiappareil | Absente | Non réalisée ; transferts manuels par export/import |
| Notifications en arrière-plan | Absentes | Non ajoutées ; vibration uniquement si l’application peut s’exécuter |
| Programme personnalisable | Modification du code seulement | Conservé comme programme fixe ; éditeur utilisateur non implémenté |
| Performance de gros historiques | Non mesurée | Non mesurée sur appareil ; pas de pagination de l’historique |

## Vérifications

- 50 assertions de logique et d’import exécutées dans le moteur JavaScript disponible pendant l’intervention.
- 57 assertions Node réussies dans la CI, dans les fuseaux Europe/Paris et America/New_York, y compris les caches, l’activation et les chemins relatifs du service worker.
- Vérification syntaxique JavaScript et Node réussie.
- 16 vérifications dans Chrome headless en CI : cinq écrans à 320 px, saisie par le DOM, validation de série, minuteur, rechargement après arrêt du serveur et page de confidentialité hors ligne.
- Aucun téléphone physique ni émulateur Android/iOS utilisé : les tests Chrome ne certifient pas Safari, l’installation native, TalkBack ou VoiceOver. Aucun score Lighthouse n’est revendiqué.
- La CI est exécutée à chaque modification de la branche ; vérifier son résultat sur le dernier commit avant fusion.

## Recette avant publication

1. Avec une copie des données existantes, ouvrir la nouvelle version et vérifier séances, progression et mesures.
2. Sur Android et iPhone, vérifier installation, largeur 320 px, agrandissement du texte, clavier numérique et navigation au lecteur d’écran.
3. Démarrer une séance, valider une série, verrouiller le téléphone au-delà du repos puis revenir : le repos doit afficher 00:00.
4. Fermer et rouvrir pendant une séance : séries et échéance de repos doivent être retrouvées.
5. Charger en ligne, passer en mode avion, fermer puis rouvrir l’application : les écrans et la page de confidentialité doivent rester disponibles.
6. Exporter, restaurer sur une installation de test, comparer les données, puis restaurer la copie avant import.
7. Refuser un JSON invalide, une sauvegarde de version inconnue et un fichier trop volumineux sans remplacer les données.
8. Simuler un quota dépassé et un stockage refusé : l’avertissement doit rester visible et l’export en mémoire doit fonctionner.
9. Installer une version suivante : la mise à jour doit être proposée, ne pas interrompre une séance et conserver les données.
10. Vérifier effacement complet des données Sprog, y compris la copie avant import. Les fichiers JSON téléchargés doivent être supprimés séparément.

## Choix nécessaires pour aller plus loin

- Choisir entre distribution PWA et publication Android/iOS. Les stores impliquent des comptes éditeur, signatures et vérifications de distribution.
- Définir si le produit reste un suivi personnel à programme fixe ou permet la création de programmes.
- Si une synchronisation est voulue : choisir l’hébergement et définir authentification, contrôle d’accès, sauvegardes serveur, suppression de compte et traitement des données. Ces fonctionnalités ne peuvent pas être remplacées honnêtement par des boutons sans backend.
- Avant diffusion publique élargie : compléter l’identité et le contact privé de l’éditeur, vérifier les pratiques de l’hébergeur et le cadre applicable au produit.
