/**
 * Vercel Serverless Function — /api/generate-debrief
 * Calls the Mistral AI API to generate a structured
 * intervention debrief based on Plasticity Scan® results.
 *
 * Required env var (set in Vercel dashboard):
 *   MISTRAL_API_KEY
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'MISTRAL_API_KEY non configurée.' })

  const { companyName, n, globalAvg, globalLevel, dimensions, levers, profiles } = req.body

  const prompt = `Tu es un consultant expert en transformations organisationnelles et diagnostics systémiques pour Plasticity Scan®, un outil d'évaluation développé par HeR Labs / Sensup.

Sur la base des données de scan ci-dessous, génère un debrief structuré et actionnable destiné à l'intervenant HeR Labs pour préparer son intervention en entreprise. Sois précis, percutant et ancré dans les données — pas de généralités. Utilise le "vous" professionnel.

═══ DONNÉES DU DIAGNOSTIC ═══
Entreprise analysée : ${companyName}
Nombre de répondants : ${n}
Score de plasticité global : ${globalAvg}/9 — Niveau : ${globalLevel}
Répartition des profils : ${profiles}
Scores par dimension :
${dimensions}
Leviers prioritaires identifiés : ${levers}

═══ FORMAT DE RÉPONSE ═══
Réponds UNIQUEMENT avec un objet JSON brut (pas de markdown, pas de code block), structuré exactement ainsi :

{
  "synthese": "2-3 phrases de synthèse exécutive percutante sur la santé organisationnelle actuelle, ancre-toi sur les chiffres",
  "tensions": [
    "Tension systémique 1 : une phrase concrète qui nomme la tension",
    "Tension systémique 2 : ...",
    "Tension systémique 3 : ..."
  ],
  "directives": [
    {
      "levier": "Nom exact du levier prioritaire",
      "couleur": "#3B82F6",
      "priorite": 1,
      "actions": [
        "Action concrète 1 — verbe d'action + livrable",
        "Action concrète 2",
        "Action concrète 3"
      ]
    },
    {
      "levier": "Deuxième levier",
      "couleur": "#14B8A6",
      "priorite": 2,
      "actions": ["...", "...", "..."]
    }
  ],
  "roadmap": [
    {
      "phase": "Phase 1 — Diagnostic & Alignement",
      "delai": "0 – 3 mois",
      "focus": "Une phrase sur le focus de cette phase",
      "actions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "phase": "Phase 2 — Activation",
      "delai": "3 – 6 mois",
      "focus": "...",
      "actions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "phase": "Phase 3 — Transformation",
      "delai": "6 – 12 mois",
      "focus": "...",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }
  ],
  "vigilance": [
    "Point de vigilance 1 : risque spécifique identifié dans les données",
    "Point de vigilance 2 : ..."
  ]
}`

  try {
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        temperature: 0.6,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en diagnostics organisationnels systémiques. Tu réponds uniquement en JSON brut, sans markdown ni code block.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!mistralRes.ok) {
      const errText = await mistralRes.text()
      console.error('[generate-debrief] Mistral error:', errText)
      return res.status(502).json({ error: 'Erreur API Mistral', detail: errText })
    }

    const result = await mistralRes.json()
    const rawText = result.choices?.[0]?.message?.content ?? ''

    // Extract JSON — handle potential markdown wrapping
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[generate-debrief] No JSON found in:', rawText)
      return res.status(500).json({ error: 'Format de réponse invalide' })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('[generate-debrief] Unexpected error:', err)
    return res.status(500).json({ error: err.message ?? 'Erreur interne' })
  }
}
