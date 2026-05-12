Prompt pour Claude CodeContexte : Crée une application web de diagnostic systémique nommée Plasticity Scan®. L'objectif est de mesurer la capacité d'une organisation à absorber la complexité et l'IA.  Stack Technique : > * Frontend : React.js avec Tailwind CSS et Lucide React pour les icônes.Graphique : Recharts (pour le Spider Web chart).Backend/DB : Supabase (Auth et Database).Étape 1 : Interface d'accueil et Authentification

* Crée une page de garde professionnelle expliquant que l'outil cartographie les zones de rigidité et les leviers d'action.

* Formulaire d'entrée : Nom de l'entreprise, Email, et sélection du profil : "Collaborateur", "Manager/Team Lead", ou "Directeur/Board".

* Configure la logique d'authentification et de stockage des données utilisateur via Supabase.  Étape 2 : Le Questionnaire (Diagnostic)

* Implémente 7 dimensions avec 2 questions par dimension.

* Système de notation : Échelle de 0 à 9 (robuste analytiquement).

* Questions basées sur des scénarios réels et résultats observables.  Étape 3 : Logique de Calcul et VisualisationCalcule la moyenne par dimension.

* Affiche un Spider Web Chart (Radar Chart) montrant les scores sur l'échelle 0-9.

* Génère un bloc de diagnostic automatique identifiant les 2-3 leviers principaux parmi : Clarté, Cohérence, Soutenabilité, Robustesse.  Étape 4 : DesignThème "Tech & Humain" : Épuré, robuste, avec une barre de progression.

* Format "Lead Magnet" intelligent : le résultat doit être visuellement impactant pour inciter à l'accompagnement.  📊 Configuration des Données (À intégrer dans le code)Pour gagner du temps, voici la structure des questions à injecter directement dans ton composant surveyData.js :Dimension Question 1 (Pratique)Question 2 (Résultat)1. Vision & AlignementChangements stratégiques expliqués < 48h ?Capacité à citer les 3 priorités du mois ?2. Gouvernance & PerformanceExperts terrain inclus dans les décisions ?Indicateurs ajustés en temps réel ?3. Culture & CohérenceValeurs affichées = Comportements vus ?Échec traité comme apprentissage ?4. Coopération & ExécutionFin des silos en cas d'urgence ?Circulation fluide de l'info ?5. Leadership & ManagementAutonomie encouragée face à l'incertitude ?Discours managérial unique ?6. Cadre & SécuritéSécurité de signaler une erreur sans sanction ?Charge mentale protégée par le cadre ?7. Engagement & RobustesseExigence maintenue malgré la crise ?Propositions spontanées liées à l'IA ?







Voici la description écrite pour + de contexte = 



description rapide: 



notre objectif 



"devenir un modèle de lecture des organisations à l’ère de la complexité, de l’incertitude et de l’IA "



“Nous mesurons la capacité réelle d’une organisation à absorber le changement et à continuer à performer sous complexité.”



Le Plasticity Scan® est un outil de diagnostic systémique rapide permettant d’évaluer la capacité réelle d’une organisation à absorber les transformations, coopérer dans la complexité et maintenir sa capacité d’exécution.



En confrontant les perceptions du terrain, du management et des dirigeants, il permet de cartographier rapidement les zones de rigidité, les écarts de perception, les fragilités systémiques et les principaux leviers d’action afin de piloter des transformations plus humaines, robustes et opérantes.