// Programme salle 12 semaines — [exercice, séries, répétitions, repos en secondes]
let PROGRAM = [
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

// Cycle du lundi 30 novembre 2026 au dimanche 24 janvier 2027.
const TOJI_START = new Date(2026, 10, 30);
const TOJI_SCHEDULE = [1, 2, 0, 3, 0, 4, 0];
const TOJI_PROGRAM = [
  {n:1, name:'Haut A — pectoraux et dos', dur:'60–75 min', ex:[
    ['Développé couché barre',3,'6–10',150], ['Tractions assistées',3,'6–10',150],
    ['Rowing poitrine appuyée',3,'8–12',120], ['Écartés à la machine',2,'10–15',90],
    ['Élévations latérales',4,'12–20',90], ['Curl incliné avec haltères',2,'10–15',90],
    ['Extension triceps à la corde',2,'10–15',90]]},
  {n:2, name:'Bas A — cuisses et ischios', dur:'50–65 min', ex:[
    ['Presse à cuisses',3,'8–12',150], ['Soulevé de terre roumain',3,'6–10',150],
    ['Leg curl assis',2,'10–15',90], ['Mollets à la presse',3,'10–15',90],
    ['Crunch à la poulie',3,'10–15',75]]},
  {n:3, name:'Haut B — dos, épaules et bras', dur:'60–75 min', ex:[
    ['Tirage vertical prise neutre',3,'8–12',150], ['Développé incliné haltères',4,'8–12',150],
    ['Rowing assis à la poulie',2,'8–12',120], ['Élévations latérales',4,'12–20',90],
    ['Oiseau à la machine',2,'12–20',90], ['Curl marteau',3,'8–15',90],
    ['Extension triceps au-dessus de la tête (poulie)',3,'10–15',90]]},
  {n:4, name:'Bas B — jambes et tronc', dur:'50–65 min', ex:[
    ['Squat ou presse selon confort',3,'8–12',150], ['Leg curl assis',3,'8–12',90],
    ['Extensions de hanches au banc à 45°',2,'10–15',90], ['Mollets assis',3,'12–20',90],
    ['Gainage latéral (secondes par côté)',2,'20–45',60]]},
  {n:5, name:'Cardio facile (facultatif)', dur:'15–25 min', ex:[
    ['Vélo ou marche (minutes)',1,'15–25',60]]}
];

// Programme permanent — six modèles, semaine répétée sans date de fin.
const LIFETIME_SCHEDULE = [1,2,3,4,5,6,0];
const LIFETIME_PROGRAM = [
  {
    "n": 1,
    "name": "Push A — dominante pectoraux",
    "dur": "65–85 min",
    "ex": [
      [
        "Développé couché barre",
        3,
        "5–8",
        180
      ],
      [
        "Développé incliné haltères",
        3,
        "8–12",
        150
      ],
      [
        "Écartés poulie haute vers basse",
        2,
        "12–15",
        90
      ],
      [
        "Élévations latérales poulie",
        3,
        "12–20",
        90
      ],
      [
        "Extension triceps au-dessus de la tête",
        3,
        "10–15",
        90
      ],
      [
        "Pompes scapulaires",
        2,
        "12–20",
        60
      ],
      [
        "Rotations externes à la poulie",
        2,
        "15–20",
        60
      ]
    ]
  },
  {
    "n": 2,
    "name": "Pull A — largeur du dos",
    "dur": "65–85 min",
    "ex": [
      [
        "Tractions pronation (assistées si nécessaire)",
        3,
        "6–10",
        180
      ],
      [
        "Rowing poitrine en appui",
        3,
        "8–12",
        150
      ],
      [
        "Pull-over à la poulie",
        2,
        "12–15",
        90
      ],
      [
        "Oiseau à la machine",
        3,
        "12–20",
        90
      ],
      [
        "Curl Bayesian à la poulie",
        3,
        "10–15",
        90
      ],
      [
        "Curl marteau",
        2,
        "10–15",
        90
      ],
      [
        "Extension des poignets",
        2,
        "15–20",
        60
      ]
    ]
  },
  {
    "n": 3,
    "name": "Legs A — dominante quadriceps",
    "dur": "75–90 min",
    "ex": [
      [
        "Hack squat ou presse",
        3,
        "8–12",
        180
      ],
      [
        "Leg extension",
        3,
        "12–15",
        90
      ],
      [
        "Leg curl assis",
        3,
        "10–15",
        90
      ],
      [
        "Machine à adducteurs",
        2,
        "12–20",
        90
      ],
      [
        "Mollets debout",
        3,
        "10–15",
        90
      ],
      [
        "Tibialis raises",
        2,
        "15–25",
        60
      ],
      [
        "Crunch à la poulie",
        3,
        "10–15",
        75
      ],
      [
        "Pallof press",
        2,
        "12 / côté",
        60
      ]
    ]
  },
  {
    "n": 4,
    "name": "Push B — épaules et triceps",
    "dur": "75–90 min",
    "ex": [
      [
        "Développé militaire assis haltères",
        3,
        "6–10",
        180
      ],
      [
        "Développé couché haltères",
        3,
        "8–12",
        150
      ],
      [
        "Écartés poulie basse vers haute",
        2,
        "12–15",
        90
      ],
      [
        "Élévations latérales machine",
        4,
        "12–20",
        90
      ],
      [
        "Extension triceps corde",
        3,
        "10–15",
        90
      ],
      [
        "Extension triceps au-dessus de la tête",
        2,
        "12–15",
        90
      ],
      [
        "Serratus punch à la poulie",
        2,
        "15–20",
        60
      ],
      [
        "Rotations externes à la poulie",
        2,
        "15–20",
        60
      ]
    ]
  },
  {
    "n": 5,
    "name": "Pull B — épaisseur du dos",
    "dur": "75–90 min",
    "ex": [
      [
        "Rowing T-bar avec appui",
        3,
        "6–10",
        180
      ],
      [
        "Tirage vertical prise neutre",
        3,
        "8–12",
        150
      ],
      [
        "Shrugs haltères",
        3,
        "10–15",
        90
      ],
      [
        "Élévations en Y",
        2,
        "12–20",
        60
      ],
      [
        "Face pull",
        3,
        "12–20",
        90
      ],
      [
        "Curl pupitre",
        3,
        "8–12",
        90
      ],
      [
        "Flexion des poignets",
        2,
        "15–20",
        60
      ],
      [
        "Farmer walk (secondes)",
        2,
        "30–45",
        90
      ]
    ]
  },
  {
    "n": 6,
    "name": "Legs B — chaîne postérieure",
    "dur": "75–90 min",
    "ex": [
      [
        "Soulevé de terre roumain",
        3,
        "6–10",
        180
      ],
      [
        "Fentes bulgares ou presse unilatérale",
        3,
        "8–12 / côté",
        150
      ],
      [
        "Leg curl allongé",
        3,
        "10–15",
        90
      ],
      [
        "Extensions lombaires à 45°",
        2,
        "12–15",
        90
      ],
      [
        "Machine à abducteurs",
        2,
        "15–20",
        90
      ],
      [
        "Mollets assis",
        3,
        "12–20",
        90
      ],
      [
        "Relevés de genoux suspendu",
        3,
        "10–15",
        75
      ],
      [
        "Gainage latéral (secondes par côté)",
        2,
        "30–45 / côté",
        60
      ]
    ]
  }
];
const COMPLEMENTARY = [
  {
    "day": "Lundi",
    "ex": [
      [
        "Isométrie cervicale douce (4 directions)",
        "2 × 10–15 s par direction",
        "Résistance manuelle légère, sans pont cervical."
      ]
    ],
    "cardio": "25 min de vélo modéré"
  },
  {
    "day": "Mardi",
    "ex": [
      [
        "Extension des doigts avec élastique",
        "2 × 20",
        "Ouvre les doigts lentement."
      ],
      [
        "Pronation et supination de l’avant-bras",
        "2 × 15 par mouvement",
        "Charge légère, coude stable."
      ]
    ],
    "cardio": "25 min de marche rapide"
  },
  {
    "day": "Mercredi",
    "ex": [
      [
        "Short foot (voûte plantaire)",
        "2 × 15",
        "Rapproche la base des orteils du talon sans les recroqueviller."
      ],
      [
        "Éversion de cheville avec élastique",
        "2 × 15 par côté",
        "Mouvement contrôlé."
      ]
    ],
    "cardio": "Aucun cardio obligatoire"
  },
  {
    "day": "Jeudi",
    "ex": [
      [
        "Isométrie cervicale douce (4 directions)",
        "2 × 10–15 s par direction",
        "Résistance légère ; arrête en cas de douleur ou vertige."
      ]
    ],
    "cardio": "25 min de vélo ou elliptique"
  },
  {
    "day": "Vendredi",
    "ex": [
      [
        "Pince avec disques",
        "2 × 30 s",
        "Prise légère à modérée, sans laisser tomber les disques."
      ],
      [
        "Déviations radiale et ulnaire du poignet",
        "2 × 15 par mouvement",
        "Faible charge, amplitude confortable."
      ]
    ],
    "cardio": "25 min de cardio modéré"
  },
  {
    "day": "Samedi",
    "ex": [
      [
        "Équilibre unipodal",
        "2 × 45 s par côté",
        "Près d’un support stable."
      ],
      [
        "Dead bug",
        "2 × 12 par côté",
        "Garde les lombaires stables."
      ]
    ],
    "cardio": "Aucun cardio obligatoire"
  },
  {
    "day": "Dimanche",
    "ex": [],
    "cardio": "50 min de marche rapide, si récupération suffisante"
  }
];
