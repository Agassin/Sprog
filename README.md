# Sprog

Application web mobile (PWA) pour suivre un programme de salle de 12 semaines : 5 séances par semaine, minuteur de repos, suivi des charges et progression. HTML / CSS / JavaScript, sans dépendance ni étape de build.

## Fonctions

- **Programme** : semaine type, séance du jour, progression sur 12 semaines
- **Séance** : séries, charge et répétitions, minuteur de repos, rappel de la dernière séance et conseil de progression
- **Progression** : courbe de charge par exercice, records
- **Suivi** : poids moyen, tour de taille et énergie, semaine par semaine
- Fonctionne **hors ligne** ; les données restent sur l'appareil (`localStorage`)

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Installer sur le téléphone

Active GitHub Pages (Settings → Pages → branche `main`), ouvre l'adresse obtenue sur le téléphone, puis « Ajouter à l'écran d'accueil ».

## Structure

| Fichier | Rôle |
|---|---|
| `program.js` | Le programme (séances, exercices, séries, repos) : à modifier pour changer de programme |
| `app.js` | Écrans, logique et stockage |
| `style.css` | Thème sombre, accent orange |
| `sw.js`, `manifest.webmanifest` | Hors ligne et installation |
