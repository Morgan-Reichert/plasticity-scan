export const dimensions = [
  {
    id: 1,
    name: 'Vision & Alignement',
    shortName: 'Vision',
    lever: 'Clarté',
    color: '#3B82F6',
    questionLevels: ['organisation', 'individuel'],
    systemicIntro: "La Vision est le signal structurant de tout le système. Son absence génère des boucles de désalignement en cascade — de la décision stratégique jusqu'aux comportements individuels. Sans cap partagé, chaque niveau interprète la complexité à sa façon.",
    questions: [
      'Les changements stratégiques sont-ils expliqués en moins de 48h ?',
      'Les collaborateurs peuvent-ils citer les 3 priorités du mois ?',
    ],
  },
  {
    id: 2,
    name: 'Gouvernance & Performance',
    shortName: 'Gouvernance',
    lever: 'Robustesse',
    color: '#8B5CF6',
    questionLevels: ['organisation', 'equipe'],
    systemicIntro: "La Gouvernance est le système nerveux de l'organisation. Elle régule la qualité des décisions et leur vitesse de propagation dans le système. Un déficit crée des angles morts qui se cristallisent en rigidités opérationnelles invisibles.",
    questions: [
      'Les experts terrain sont-ils inclus dans les décisions ?',
      'Les indicateurs sont-ils ajustés en temps réel ?',
    ],
  },
  {
    id: 3,
    name: 'Culture & Cohérence',
    shortName: 'Culture',
    lever: 'Cohérence',
    color: '#14B8A6',
    questionLevels: ['equipe', 'individuel'],
    systemicIntro: "La Culture est le code implicite qui gouverne les comportements réels, indépendamment des règles formelles. Les écarts entre valeurs déclarées et pratiques vécues sont les premiers signaux d'une fragilité systémique — souvent invisibles depuis le sommet.",
    questions: [
      'Les valeurs affichées correspondent-elles aux comportements observés ?',
      "L'échec est-il traité comme un apprentissage ?",
    ],
  },
  {
    id: 4,
    name: 'Coopération & Exécution',
    shortName: 'Coopération',
    lever: 'Soutenabilité',
    color: '#F59E0B',
    questionLevels: ['organisation', 'equipe'],
    systemicIntro: "La Coopération est le système circulatoire de l'organisation — celui qui traduit les décisions en exécution collective. Son affaiblissement crée des silos qui isolent les intelligences, ralentissent l'adaptation et épuisent les interfaces.",
    questions: [
      "Les silos disparaissent-ils en cas d'urgence ?",
      "L'information circule-t-elle de façon fluide ?",
    ],
  },
  {
    id: 5,
    name: 'Leadership & Management',
    shortName: 'Leadership',
    lever: 'Clarté',
    color: '#EC4899',
    questionLevels: ['individuel', 'organisation'],
    systemicIntro: "Le Leadership est l'interface entre la complexité du système et la capacité d'action des individus. Il amplifie ou absorbe les tensions systémiques selon sa qualité d'ancrage dans le réel — et sa cohérence entre niveaux hiérarchiques.",
    questions: [
      "L'autonomie est-elle encouragée face à l'incertitude ?",
      'Le discours managérial est-il unique et cohérent ?',
    ],
  },
  {
    id: 6,
    name: 'Cadre & Sécurité',
    shortName: 'Cadre',
    lever: 'Soutenabilité',
    color: '#10B981',
    questionLevels: ['individuel', 'equipe'],
    systemicIntro: "Le Cadre est la condition de possibilité de l'engagement durable. Sans sécurité psychologique et protection de la charge mentale, les systèmes performants s'épuisent silencieusement — même quand les indicateurs restent apparemment au vert.",
    questions: [
      'Les collaborateurs se sentent-ils en sécurité pour signaler une erreur sans sanction ?',
      'Le cadre protège-t-il la charge mentale ?',
    ],
  },
  {
    id: 7,
    name: 'Engagement & Robustesse',
    shortName: 'Engagement',
    lever: 'Robustesse',
    color: '#F97316',
    questionLevels: ['organisation', 'individuel'],
    systemicIntro: "L'Engagement est l'énergie disponible du système sous contrainte. La robustesse se mesure à la capacité de maintenir l'exigence et l'initiative même dans la crise — c'est l'indicateur le plus fiable de la plasticité organisationnelle réelle.",
    questions: [
      "L'exigence est-elle maintenue malgré la crise ?",
      "Des propositions spontanées liées à l'IA émergent-elles ?",
    ],
  },
]

/* ── Niveaux systémiques ── */
export const levelMeta = {
  individuel: {
    key: 'individuel',
    label: 'Individuel',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    symbol: '◎',
    description: "Capacité de chaque collaborateur à s'adapter, prendre de l'initiative et maintenir son engagement dans la complexité.",
    questionCount: 4,
  },
  equipe: {
    key: 'equipe',
    label: 'Équipe & BU',
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.10)',
    border: 'rgba(20,184,166,0.25)',
    symbol: '◉',
    description: "Fluidité de la coopération, cohérence des pratiques et capacité d'exécution collective face aux transformations.",
    questionCount: 4,
  },
  organisation: {
    key: 'organisation',
    label: 'Organisation',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.25)',
    symbol: '●',
    description: "Cohérence systémique globale — alignement de la vision, de la gouvernance et des signaux envoyés à l'ensemble du système.",
    questionCount: 6,
  },
}

/* ── Lecture croisée inter-niveaux ── */
export function getSystemicNarrative(scores) {
  const { individuel, equipe, organisation } = scores
  const avg = (individuel + equipe + organisation) / 3

  if (organisation >= 6.5 && individuel <= 3.5) return {
    tension: 'Paradoxe système ↓ individu',
    text: "Le système organisationnel envoie des signaux structurés, mais les individus ne s'y projettent plus. Risque d'épuisement silencieux et de désengagement progressif malgré des indicateurs apparemment stables.",
    urgency: 'high',
  }
  if (individuel >= 6.5 && organisation <= 3.5) return {
    tension: 'Énergie individuelle bloquée',
    text: "Les individus sont engagés et capables, mais le cadre organisationnel ne les soutient pas. L'énergie disponible se perd dans les frictions systémiques. Fort potentiel inexploité — risque de fuite des talents.",
    urgency: 'high',
  }
  if (equipe <= 3.5 && (individuel >= 5.5 || organisation >= 5.5)) return {
    tension: 'Rupture d\'exécution collective',
    text: "Malgré des individus engagés ou une direction alignée, les équipes ne parviennent pas à transformer les intentions en exécution cohérente. Les silos résistent, l'information se perd en transit — le middle management absorbe une pression disproportionnée.",
    urgency: 'high',
  }
  if (organisation >= 6 && equipe >= 6 && individuel <= 4) return {
    tension: 'Décrochage du terrain',
    text: "Le système est solide aux deux premiers niveaux, mais les individus décrochent. La performance collective masque un désengagement latent qui peut se déclencher brutalement en période de turbulence.",
    urgency: 'medium',
  }
  if (individuel >= 6 && equipe <= 4 && organisation <= 4) return {
    tension: 'Système porté par les individus',
    text: "Les individus portent le système à bout de bras. Sans structure collective ni cadre organisationnel solide, cette configuration est fragile et non scalable — elle repose sur les personnes plutôt que sur le système.",
    urgency: 'high',
  }
  if (avg <= 3) return {
    tension: 'Fragilité systémique généralisée',
    text: "Les trois niveaux du système sont sous tension simultanément. L'organisation est en état de fatigue systémique avancée. Une intervention structurée et prioritaire est nécessaire avant d'engager toute transformation.",
    urgency: 'critical',
  }
  if (avg >= 7) return {
    tension: 'Plasticité systémique élevée',
    text: "Les trois niveaux du système sont alignés et robustes. L'organisation démontre une forte capacité d'absorption du changement. Le défi principal est de maintenir cet état sous pression de croissance ou de transformation.",
    urgency: 'low',
  }
  if (equipe >= 6.5 && Math.abs(individuel - organisation) >= 3) return {
    tension: 'Équipes tampons inter-niveaux',
    text: "Les équipes assurent la cohésion là où la vision et l'engagement individuel divergent. Situation d'équilibre fragile — les managers de proximité absorbent une tension systémique qui devrait être résolue structurellement.",
    urgency: 'medium',
  }
  const highest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  const levelLabels = { individuel: 'individuelle', equipe: 'collective (équipes)', organisation: 'organisationnelle' }
  return {
    tension: 'Profil asymétrique',
    text: `La plasticité ${levelLabels[highest]} est la ressource la plus forte du système. C'est le levier prioritaire pour tirer les niveaux plus fragiles. Sans activation délibérée, cette asymétrie peut devenir une source de tension inter-niveaux.`,
    urgency: 'medium',
  }
}

export function computeLevelScores(responses) {
  const buckets = { individuel: [], equipe: [], organisation: [] }
  dimensions.forEach((dim) => {
    dim.questionLevels.forEach((level, qi) => {
      const val = responses[`${dim.id}_${qi}`] ?? 0
      buckets[level].push(Number(val))
    })
  })
  const avg = (arr) => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0
  return {
    individuel: avg(buckets.individuel),
    equipe: avg(buckets.equipe),
    organisation: avg(buckets.organisation),
  }
}

/* ── Leviers ── */
export const leverDescriptions = {
  Clarté: {
    title: 'Levier : Clarté',
    description: "Votre organisation manque de lisibilité dans ses choix et priorités. Les décisions ne sont pas suffisamment visibles pour mobiliser l'ensemble des équipes.",
    action: 'Renforcer la communication descendante et la cohérence des messages stratégiques.',
  },
  Cohérence: {
    title: 'Levier : Cohérence',
    description: "Des écarts entre les valeurs affichées et les comportements réels créent de la méfiance et réduisent la capacité d'exécution collective.",
    action: "Aligner les pratiques managériales sur les valeurs déclarées et traiter les incohérences visibles.",
  },
  Soutenabilité: {
    title: 'Levier : Soutenabilité',
    description: "Le rythme et le cadre de travail fragilisent la capacité à maintenir la performance dans la durée sous pression.",
    action: "Revoir les conditions d'exécution, protéger la bande passante des équipes et structurer les coopérations.",
  },
  Robustesse: {
    title: 'Levier : Robustesse',
    description: "Les processus de décision et d'engagement ne résistent pas suffisamment aux perturbations et à la complexité montante.",
    action: "Développer des boucles de feedback rapides et renforcer la capacité d'adaptation systémique.",
  },
}

export function computeScores(responses) {
  return dimensions.map((dim) => {
    const q1 = responses[`${dim.id}_0`] ?? 0
    const q2 = responses[`${dim.id}_1`] ?? 0
    const avg = (q1 + q2) / 2
    return { ...dim, score: parseFloat(avg.toFixed(1)) }
  })
}

export function identifyLevers(scores) {
  const sorted = [...scores].sort((a, b) => a.score - b.score)
  const weakest = sorted.slice(0, 3)
  const leversSeen = new Set()
  return weakest.filter((d) => {
    if (leversSeen.has(d.lever)) return false
    leversSeen.add(d.lever)
    return true
  })
}

export function plasticityLevel(avgScore) {
  if (avgScore >= 7) return { label: 'Plasticité élevée', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' }
  if (avgScore >= 4) return { label: 'Zone de tension', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Zone critique', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
}
