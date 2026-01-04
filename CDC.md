# Cahier des charges – Application de QCM "Esthétique Quiz"

## 1) Objectif
Créer une application web de quiz (QCM) pour des apprenants en esthétique/cosmétologie.
Le quiz doit être simple, ludique, coloré (inspiré des visuels fournis) et utilisable sur mobile.
Les réponses et statistiques doivent être accessibles dans un espace administrateur.

## 2) Périmètre fonctionnel

### 2.1. Espace participant (quiz)
- Écran d’accueil
  - Demander : prénom, nom, email
  - Bouton “Commencer le quiz”
  - Si un score existe déjà pour cet email, l’utilisateur est redirigé vers le résultat
- Règles du jeu
  - Texte clair et court
  - Le nombre de questions affiché doit être dynamique (ex : “Tu dois répondre à 5 questions”)
- Questions
  - Affichage 1 question à la fois
  - Choix unique (A, B, C, D…)
  - Après chaque réponse : afficher immédiatement la bonne réponse
  - Puis bouton “Suivant”
- Fin de quiz
  - Affichage du score final (ex : “4 / 5”)
  - Affichage du temps total (mm:ss)
  - Récapitulatif des réponses (bonne réponse + réponse donnée)
  - Boutons :
    - “Partager mon score” (via image)
    - “Télécharger l’image”
    - “Voir le leaderboard”
- Reprise / persistance
  - Le quiz doit être sauvegardé automatiquement (local storage)
  - Si la personne revient et a déjà un score, redirection vers /result

### 2.2. Espace administrateur
- Configuration globale
  - Modifier le nom de l’application
- Gestion des questions (CRUD)
  - Ajouter / modifier / supprimer une question
  - Si une question est modifiée ou supprimée, afficher un warning :
    “Toutes les tentatives précédentes seront supprimées.”
- Résultats
  - Voir le nombre total de réponses
  - Voir la liste détaillée des réponses (nom, prénom, email, score, détail)
  - Supprimer une tentative (bouton “Supprimer”)
  - Voir le temps de chaque réponse
- Statistiques globales
  - Moyenne, médiane, min, max
  - Distribution des scores (ex : “4/5 : 12”)
  - Temps moyen

### 2.3. Leaderboard public
- Accessible aux participants après avoir répondu
- Classement par score décroissant puis temps croissant
- Affiche : rang, prénom/nom, score, temps

## 3) Contraintes
- Responsive : mobile en priorité
- Design : inspiré des visuels fournis (pastel, playful, encadrés, typo arrondie)
- Partage : image du score (format mobile vertical)
  - L’image inclut le score et le temps total
- Unicité : une tentative par email (la dernière remplace l’ancienne)
- Déploiement : via docker-compose, front exposé, API interne

## 4) Pages attendues
- `/` Accueil (formulaire nom/prénom/email)
- `/rules` Règles
- `/quiz` Quiz question par question
- `/result` Résultat final + partage
- `/leaderboard` Classement public
- `/admin` Espace administrateur

## 5) Livrables attendus
- Application web fonctionnelle
- Docker Compose prêt au déploiement
- Documentation minimale (comment démarrer)
