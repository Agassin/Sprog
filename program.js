// Programme salle 12 semaines — [exercice, séries, répétitions, repos en secondes]
const PROGRAM = [
  { n: 1, name: "Haut du corps — force", dur: "65–80 min", ex: [
    ["Développé couché (barre ou machine)", 3, "5–7", 150],
    ["Rowing poitrine appuyée", 3, "6–8", 120],
    ["Développé incliné haltères", 3, "6–8", 120],
    ["Tirage vertical prise neutre", 3, "6–8", 120],
    ["Développé épaules à la machine", 2, "6–8", 120],
    ["Élévations latérales", 2, "12–15", 75],
    ["Extension triceps à la poulie", 2, "10–15", 75],
    ["Curl biceps (poulie ou haltères)", 2, "10–15", 75]] },
  { n: 2, name: "Bas du corps A — chaîne postérieure", dur: "55–70 min", ex: [
    ["Soulevé de terre roumain (haltères)", 3, "6–8", 150],
    ["Leg curl assis", 3, "10–15", 90],
    ["Extension de jambes à la machine", 3, "10–15", 90],
    ["Hip thrust (machine ou barre)", 3, "8–12", 120],
    ["Mollets debout à la machine", 3, "10–15", 75],
    ["Dead bug", 3, "8–10 / côté", 60]] },
  { n: 3, name: "Poussée — hypertrophie", dur: "60–75 min", ex: [
    ["Développé incliné haltères", 3, "8–12", 120],
    ["Chest press à la machine", 3, "8–12", 120],
    ["Écartés à la poulie", 2, "12–15", 75],
    ["Développé épaules assis à la machine", 3, "8–12", 120],
    ["Élévations latérales", 3, "12–20", 75],
    ["Extension triceps au-dessus de la tête (poulie)", 3, "10–15", 75],
    ["Pushdown corde", 2, "12–15", 75]] },
  { n: 4, name: "Tirage — hypertrophie", dur: "55–70 min", ex: [
    ["Tirage vertical prise neutre ou tractions assistées", 3, "8–12", 120],
    ["Rowing poitrine appuyée", 3, "8–12", 120],
    ["Rowing assis à la poulie", 2, "10–15", 90],
    ["Oiseau à la machine (reverse pec deck)", 3, "12–20", 75],
    ["Curl incliné avec haltères", 3, "10–15", 75],
    ["Curl marteau", 2, "10–15", 75]] },
  { n: 5, name: "Bas du corps B + abdos", dur: "55–75 min", ex: [
    ["Hip thrust (machine) ou pont fessier", 3, "8–12", 120],
    ["Leg curl allongé ou assis", 3, "10–15", 90],
    ["Extension de jambes à la machine", 3, "12–15", 90],
    ["Pull-through à la poulie", 2, "12–15", 90],
    ["Abducteurs à la machine", 2, "15–20", 75],
    ["Mollets assis", 3, "12–20", 75],
    ["Crunch à la poulie", 3, "10–15", 60],
    ["Pallof press à la poulie", 2, "10–12 / côté", 60]] }
];
