# Plan de réalisation - QCM

## Objectif
Créer une application web de QCM inspirée des visuels fournis, déployable via docker-compose, avec deux espaces :
- Participant : quiz pas à pas, score final, partage, reprise via localStorage.
- Admin/config : gestion des questions, suivi des réponses et statistiques.

## Stack proposée
- Frontend : React + Vite (TS)
- UI : Tailwind CSS + shadcn/ui
- Backend : Node.js + Express
- DB : SQLite (persistée via volume Docker)
- Partage d’image : rendu canvas côté client + Web Share API (fallback téléchargement)

## Parcours utilisateur (Participant)
1. Écran d’accueil
   - Saisie : nom, prénom, email
   - CTA “Commencer le quiz”
2. Présentation / règles (slide)
3. Quiz (choix unique)
   - Questions une par une
   - Après réponse : feedback (bonne/mauvaise réponse) + affichage de la bonne réponse
   - Bouton “Suivant”
4. Résultat final
   - Score + recap
   - Bouton “Partager mon score” (image mobile)
5. Reprise
   - Reprise automatique si quiz en cours (localStorage)

## Back-office / Config globale
- Nom de l’application (settings global)
- CRUD questions
  - Alerte si modification : “Toutes les tentatives précédentes seront supprimées”
- Dashboard
  - Total de réponses
  - Liste détaillée (nom, prénom, email, score, détail)
  - Statistiques globales : moyenne, médiane, min, max, distribution

## Données & API
- Entités principales
  - Settings (appName)
  - Questions (id, label, choices, correctChoice)
  - Attempts (user info, answers, score, timestamps)
- Endpoints
  - GET/PUT /settings
  - CRUD /questions
  - POST /attempts
  - GET /attempts (liste + stats)

## LocalStorage (résumabilité)
- Stocker : user info, questionIndex, réponses, timestamps
- Récupération au chargement
- Clear à la fin ou si reset admin

## UI / Design
- Style inspiré des visuels : couleurs pastel, cadres fins, typographies ludiques
- Layout responsive mobile-first
- Animations légères : transitions de cartes, feedback de réponse

## Docker & déploiement
- Dockerfile frontend (build + serve)
- Dockerfile backend
- docker-compose.yml
  - services : web, api
  - volume : sqlite

## Phasage
1. Initialisation projet + design system (styles, palette, fonts)
2. Frontend parcours participant
3. Backend + persistance
4. Admin/config
5. Partage image + polish UI
6. Docker-compose

## Questions ouvertes
- Auth admin : simple page protégée par mot de passe ou accès libre ?
- Besoin d’export CSV des résultats ?
- Nombre de questions par défaut ?
