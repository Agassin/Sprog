# Android : compilation et distribution

L’identifiant de l’application est `fr.agassin.sprog`. Les ressources web sont embarquées dans l’APK ; aucune URL distante ni clé d’API n’est requise pour lancer une séance. Capacitor 8, plugins et outils de compilation JavaScript sont verrouillés dans package-lock.json.

## APK de test

Chaque exécution de CI réussie produit l’artefact **Sprog-Android-test**, contenant `app-debug.apk`. Télécharger et extraire cet artefact depuis GitHub Actions, puis ouvrir l’APK sur Android et autoriser l’installation pour la source choisie.

Ce fichier est signé avec une clé de débogage créée par le serveur de compilation. **La clé peut changer d’une exécution à l’autre** : une mise à jour peut nécessiter la désinstallation. Exporter les données avant de désinstaller, puis restaurer la sauvegarde. Pour un usage quotidien sans cette contrainte, la PWA bénéficie de mises à jour conservant les données.

## Fonctions natives

- Le bouton Retour ramène à Programme ou minimise l’application. Une modification de programme non enregistrée demande confirmation.
- L’export écrit un fichier dans le cache privé, puis ouvre le partage Android. Une seule copie temporaire est conservée et remplacée au prochain export ; l’effacement des données Sprog supprime cette copie.
- L’import utilise le sélecteur de fichier de la WebView.
- Les sauvegardes automatiques Android de l’application sont désactivées. Le transfert s’effectue explicitement par export/import.
- Pas de permissions caméra, microphone ou localisation. Pas de notification de repos garantie lorsque l’application est suspendue.

## Publication de production

Une publication Play Store requiert un compte développeur, une identité éditeur, les déclarations du produit et une clé de signature privée durable. Ceux-ci ne sont ni créés ni inventés par le projet. Ne jamais commiter la clé privée.

Pour la distribution de production : configurer la signature de release avec un keystore conservé dans un gestionnaire de secrets, définir les numéros de version, compiler `bundleRelease`, tester l’AAB et finaliser la fiche Play Console. Conserver la même identité de signature pour permettre les mises à jour.

Sur iPhone, utiliser la PWA. Aucun binaire iOS signé n’est fourni : il nécessiterait Xcode, une identité de signature et le compte Apple approprié.
