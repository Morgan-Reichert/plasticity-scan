export const dimensions = [
  {
    id: 1,
    name: 'Vision & Alignement',
    shortName: 'Vision',
    lever: 'Clarté',
    color: '#3B82F6',
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
    questions: [
      "L'exigence est-elle maintenue malgré la crise ?",
      "Des propositions spontanées liées à l'IA émergent-elles ?",
    ],
  },
]

export const leverDescriptions = {
  Clarté: {
    title: 'Levier : Clarté',
    description:
      "Votre organisation manque de lisibilité dans ses choix et priorités. Les décisions ne sont pas suffisamment visibles pour mobiliser l'ensemble des équipes.",
    action: 'Renforcer la communication descendante et la cohérence des messages stratégiques.',
  },
  Cohérence: {
    title: 'Levier : Cohérence',
    description:
      "Des écarts entre les valeurs affichées et les comportements réels créent de la méfiance et réduisent la capacité d'exécution collective.",
    action: "Aligner les pratiques managériales sur les valeurs déclarées et traiter les incohérences visibles.",
  },
  Soutenabilité: {
    title: 'Levier : Soutenabilité',
    description:
      "Le rythme et le cadre de travail fragilisent la capacité à maintenir la performance dans la durée sous pression.",
    action: "Revoir les conditions d'exécution, protéger la bande passante des équipes et structurer les coopérations.",
  },
  Robustesse: {
    title: 'Levier : Robustesse',
    description:
      "Les processus de décision et d'engagement ne résistent pas suffisamment aux perturbations et à la complexité montante.",
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
