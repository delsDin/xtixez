export const skillsData = {
  development: [
    { name: 'React', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'TypeScript', level: 80 },
    { name: 'Python', level: 95 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'PostgreSQL', level: 80 },
  ],
  dataScience: [
    { name: 'Pandas', level: 95 },
    { name: 'Scikit-learn', level: 85 },
    { name: 'TensorFlow', level: 75 },
    { name: 'SQL', level: 90 },
    { name: 'Data Visualization (D3.js)', level: 70 },
    { name: 'Machine Learning', level: 85 },
  ],
  autres: [
    { name: 'Git & GitHub', level: 90 },
    { name: 'Docker', level: 75 },
    { name: 'CI/CD', level: 70 },
    { name: 'Méthodes Agiles', level: 85 },
    { name: 'AWS / Cloud', level: 65 },
    { name: 'UI/UX Design', level: 60 },
  ]
};

export const projectsData = [
  {
    id: 1,
    title: 'Dashboard Analytique E-commerce',
    category: 'Autres',
    image: 'https://picsum.photos/seed/dashboard/800/600',
    techs: ['React', 'Python', 'FastAPI', 'Pandas'],
    description: 'Une plateforme interactive pour visualiser les ventes et prédire les tendances futures grâce au Machine Learning.',
    details: 'Ce projet combine un frontend React moderne avec un backend FastAPI performant. Le modèle de Machine Learning entraîné avec Scikit-learn prédit les ventes avec une précision de 85%.',
    github: '#',
    demo: 'sit.f'
  },
  {
    id: 2,
    title: 'Application de Gestion de Tâches',
    category: 'Dev',
    image: 'https://picsum.photos/seed/taskapp/800/600',
    techs: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
    description: 'Application full-stack de gestion de tâches avec authentification et temps réel.',
    details: 'Développement complet d\'une application SaaS permettant la collaboration en temps réel via WebSockets.',
    github: '#',
    demo: '#'
  },
  {
    id: 3,
    title: 'Classification d\'Images Médicales',
    category: 'Data',
    image: 'https://picsum.photos/seed/medical/800/600',
    techs: ['TensorFlow', 'Python', 'OpenCV'],
    description: 'Modèle de Deep Learning pour la détection précoce de maladies sur des radiographies.',
    details: 'Utilisation de réseaux de neurones convolutifs (CNN) pour atteindre une précision de 92% sur un dataset de 10 000 images.',
    github: '#',
    demo: '#'
  },
  {
    id: 4,
    title: 'Portfolio Interactif',
    category: 'Dev',
    image: 'https://picsum.photos/seed/portfolio/800/600',
    techs: ['React', 'Framer Motion', 'Tailwind'],
    description: 'Mon portfolio personnel présentant mes compétences et projets.',
    details: 'Création d\'une interface utilisateur fluide avec des animations avancées et un support complet du mode sombre.',
    github: '#',
    demo: '#'
  },
  {
    id: 5,
    title: 'Analyseur de Sentiments NLP',
    category: 'Data',
    image: 'https://picsum.photos/seed/nlp/800/600',
    techs: ['Python', 'Hugging Face', 'PyTorch', 'Streamlit'],
    description: 'Application web analysant le sentiment des avis clients en temps réel.',
    details: 'Utilisation d\'un modèle transformer pré-entraîné (BERT) fine-tuné sur un corpus d\'avis en français, déployé via une interface Streamlit interactive.',
    github: '#',
    demo: '#'
  },
  {
    id: 6,
    title: 'Plateforme de E-learning',
    category: 'Dev',
    image: 'https://picsum.photos/seed/elearning/800/600',
    techs: ['Next.js', 'TypeScript', 'Prisma', 'Stripe'],
    description: 'Plateforme complète de cours en ligne avec paiements intégrés.',
    details: 'Architecture moderne avec Next.js App Router, base de données PostgreSQL gérée avec Prisma, et intégration de Stripe pour les abonnements.',
    github: '#',
    demo: '#'
  }
];

export const experienceData = [
  {
    id: 1,
    role: 'Data Scientist Senior',
    company: 'Tech Innovators Inc.',
    period: '2021 - Présent',
    description: [
      'Développement de modèles prédictifs augmentant le CA de 15%.',
      'Mise en place de pipelines de données automatisés avec Apache Airflow.',
      'Mentorat de développeurs juniors.'
    ],
    details: 'Chez Tech Innovators Inc., je dirige l\'implémentation d\'algorithmes d\'apprentissage automatique pour optimiser les ventes de commerce électronique à grande échelle. Mes tâches quotidiennes englobent la conception de réseaux neuronaux complexes, l\'optimisation de requêtes Big Data et la supervision d\'une équipe de Data Analysts.',
    technologies: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Apache Airflow', 'Docker', 'AWS'],
    achievements: [
      'Conception d\'un modèle de recommandation personnalisé en temps réel ayant généré +15% de CA en 6 mois.',
      'Migration complète de pipelines de données legacy vers Apache Airflow, réduisant les temps de traitement quotidiens de 35%.',
      'Mise en place d\'un framework interne d\'évaluation de modèles ML (A/B testing automatisé).'
    ]
  },
  {
    id: 2,
    role: 'Développeur Full-Stack',
    company: 'WebSolutions Agency',
    period: '2018 - 2021',
    description: [
      'Création d\'applications web sur mesure pour divers clients.',
      'Migration d\'une architecture monolithique vers des microservices.',
      'Optimisation des performances front-end (temps de chargement réduit de 40%).'
    ],
    details: 'En tant que Développeur Full-Stack principal chez WebSolutions, j\'ai collaboré étroitement avec des chefs de produit pour concevoir et déployer plus de 15 applications web hautement performantes. J\'ai mené la transition vers les frameworks SPA modernes (React et TypeScript) et renforcé l\'intégration continue.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Git'],
    achievements: [
      'Refonte de l\'interface client majeure d\'un grand compte logistique, améliorant le score d\'utilisabilité UX de 50%.',
      'Monétisation réussie d\'une plateforme de e-learning intégrant le processeur de paiement Stripe.',
      'Mise en place d\'un système robuste d\'authentification par jeton (JWT) avec session sécurisée.'
    ]
  },
  {
    id: 3,
    role: 'Formation : Master en Data Science',
    company: 'Université des Sciences',
    period: '2016 - 2018',
    description: [
      'Spécialisation en Machine Learning et Big Data.',
      'Projet de fin d\'études sur le traitement du langage naturel (NLP).'
    ],
    details: 'Ce Master m\'a permis d\'acquérir des bases théoriques solides et des compétences pratiques poussées en statistiques multivariées, calcul intensif et programmation scientifique.',
    technologies: ['R', 'Python', 'SQL', 'Hadoop', 'Spark', 'Matplotlib'],
    achievements: [
      'Mémoire de recherche de fin d\'études axé sur le Fine-Tuning de modèles de langage (NLP / BERT) appliqué aux avis francophones.',
      'Validation de projets académiques concrets en utilisant l\'écosystème Hadoop/Spark pour l\'analyse de pétaoctets de logs web.'
    ]
  }
];

export const testimonialsData = [
  {
    id: 1,
    name: 'Alice Dupont',
    role: 'CTO, Tech Innovators',
    message: 'Un développeur exceptionnel avec une rare capacité à comprendre à la fois les enjeux de l\'ingénierie logicielle et de la data science.',
    avatar: 'https://picsum.photos/seed/alice/150/150'
  },
  {
    id: 2,
    name: 'Marc Martin',
    role: 'Product Manager, WebSolutions',
    message: 'Toujours force de proposition, il a su transformer nos idées complexes en interfaces simples et performantes.',
    avatar: 'https://picsum.photos/seed/marc/150/150'
  }
];

export const servicesData = [
  {
    id: 'analytics',
    title: 'Analyse & Science des Données',
    description: 'Transformation de vos données brutes en insights stratégiques et décisions éclairées.',
    longDescription: 'La science des données est au cœur de la transformation digitale. Je vous aide à extraire la valeur cachée dans vos données pour prendre des décisions basées sur des faits plutôt que sur l\'intuition.',
    iconName: 'chart',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    features: [
      'Exploration et nettoyage de données',
      'Analyses exploratrices avancées',
      'Visualisations interactives et tableaux de bord',
      'Rapports d\'analyse approfondis'
    ],
    advantages: [
      'Identification de tendances et patterns cachés',
      'Optimisation des processus métier',
      'Augmentation de la rentabilité et des revenus',
      'Réduction des risques opérationnels'
    ],
    useCases: [
      'Analyse comportementale des clients',
      'Segmentation et prédiction de churn',
      'Analyse de rentabilité produit/service',
      'Détection d\'anomalies et fraudes',
      'Études de marché et tendances'
    ],
    technologies: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'SQL'],
    duration: '2-4 semaines',
    deliverables: [
      'Rapport d\'analyse complet',
      'Visualisations professionnelles',
      'Recommandations actionnables',
      'Présentation exécutive'
    ]
  },
  {
    id: 'ml',
    title: 'Machine Learning & IA',
    description: 'Développement de modèles prédictifs et solutions IA pour automatiser vos processus métier.',
    longDescription: 'Automatisez vos flux de décision complexes en intégrant de l\'intelligence artificielle à vos applications. Je conçois des modèles robustes, précis et scalables adaptés à votre contexte.',
    iconName: 'brain',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    features: [
      'Développement de modèles ML sur mesure',
      'Prédictions et classification',
      'Optimisation d\'algorithmes',
      'Déploiement et monitoring'
    ],
    advantages: [
      'Automatisation des tâches répétitives',
      'Amélioration continue grâce à l\'apprentissage',
      'Précision accrue des prédictions de vente',
      'Personnalisation de l\'expérience utilisateur'
    ],
    useCases: [
      'Recommandations personnalisées',
      'Prédiction des ventes et de la demande',
      'Classification automatique d\'images',
      'Chatbots intelligents (RAG)',
      'Maintenance préventive industrielle'
    ],
    technologies: ['Python', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'Hugging Face', 'MLflow'],
    duration: '4-8 semaines',
    deliverables: [
      'Code source documenté',
      'API de prédiction / Modèle entraîné',
      'Script de réapprentissage automatique',
      'Rapport de performance & métriques ML'
    ]
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    description: 'Construction d\'architectures de données robustes et scalables pour propulser vos opérations.',
    longDescription: 'Pour faire de la science des données, il faut d\'abord une base solide. Je conçois des entrepôts de données et des pipelines ETL/ELT fluides pour fiabiliser et automatiser vos flux d\'information.',
    iconName: 'database',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    features: [
      'Conception de pipelines ETL/ELT',
      'Architecture bases de données',
      'Automatisation des traitements',
      'Optimisation des performances'
    ],
    advantages: [
      'Données fiables, propres et centralisées',
      'Réduction des temps de latence des requêtes',
      'Évolutivité de l\'infrastructure de données',
      'Sécurisation et conformité des flux de données'
    ],
    useCases: [
      'Entrepôts de données (Data Warehouse)',
      'Pipelines de données en temps réel',
      'Migration vers le Cloud',
      'Automatisation de rapports',
      'Gestion de lacs de données (Data Lake)'
    ],
    technologies: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'PostgreSQL', 'Docker', 'AWS/GCP'],
    duration: '3-6 semaines',
    deliverables: [
      'Infrastructure as Code (IaC)',
      'Code complet des pipelines de données',
      'Documentation de l\'architecture',
      'Configateurs de monitoring & alertes'
    ]
  }
];
