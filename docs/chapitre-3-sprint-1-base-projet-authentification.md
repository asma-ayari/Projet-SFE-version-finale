# Chapitre 3 - Sprint 1: Base projet et authentification

## 3.1 Introduction du Sprint 1

Le Sprint 1 a pour objectif de poser les fondations techniques et fonctionnelles de la plateforme. Il couvre:

1. La mise en place de la base projet (backend FastAPI, frontend Angular, structure modulaire).
2. Le socle de securite et d'authentification (JWT, OAuth Google, protection des acces).
3. Les fonctions essentielles de gestion des comptes et des utilisateurs.

Ce sprint constitue la base sur laquelle les sprints suivants (cours, QCM, chatbot, statistiques) peuvent s'appuyer.

## 3.2 Objectif et perimetre

### 3.2.1 Objectif general

Fournir un systeme d'authentification fiable, securise et extensible, avec gestion des roles (admin, formateur, apprenant).

### 3.2.2 Perimetre fonctionnel retenu

Les cas d'utilisation raffines pour ce sprint sont:

1. Authentification:
   - Inscription locale
   - Connexion locale
   - Connexion Google
   - Mot de passe oublie
   - Reinitialisation du mot de passe
   - Rafraichissement du token
2. Gestion du profil:
   - Consultation du profil
   - Changement du mot de passe
3. Gestion des utilisateurs (admin):
   - Lister les utilisateurs
   - Creer un utilisateur
   - Modifier le role
   - Activer/desactiver un compte
   - Supprimer un utilisateur

## 3.3 Acteurs du Sprint 1

1. Visiteur: utilisateur non authentifie qui accede aux pages publiques et aux ecrans d'authentification.
2. Utilisateur authentifie: apprenant, formateur ou administrateur connecte.
3. Administrateur: utilisateur authentifie avec privileges etendus pour gerer les comptes.
4. Google OAuth: fournisseur externe d'identite.
5. Service Email SMTP: service externe pour l'envoi du code de reinitialisation.

## 3.4 Cas d'utilisation raffines (Sprint 1)

## 3.4.1 UC1 - S'inscrire (local)

1. Acteur principal: Visiteur.
2. Preconditions: email et username non utilises.
3. Scenario nominal:
   - Le visiteur soumet username, email, mot de passe, nom complet.
   - Le systeme valide la complexite du mot de passe et l'unicite des donnees.
   - Le compte est cree en base avec mot de passe hache.
   - Le systeme retourne access token, refresh token et profil.
4. Postconditions: compte actif cree et session ouverte.
5. Exceptions: email/username deja existant, mot de passe non conforme.

## 3.4.2 UC2 - Se connecter (local)

1. Acteur principal: Visiteur.
2. Preconditions: compte local existant et actif.
3. Scenario nominal:
   - L'utilisateur saisit email + mot de passe.
   - Le systeme verifie rate limit, credentials et etat du compte.
   - Le systeme genere et retourne les tokens JWT et le profil.
4. Postconditions: session authentifiee ouverte.
5. Exceptions: compte Google sans mot de passe, identifiants invalides, compte desactive, blocage rate limit.

## 3.4.3 UC3 - Se connecter avec Google

1. Acteur principal: Visiteur.
2. Acteur secondaire: Google OAuth.
3. Preconditions: credential Google valide.
4. Scenario nominal:
   - Le visiteur choisit l'authentification Google.
   - Le systeme verifie le token Google (audience + email verifie).
   - Le systeme retrouve ou cree le compte local associe.
   - Le systeme retourne les tokens JWT de la plateforme.
5. Postconditions: session ouverte avec compte lie a Google.
6. Exceptions: token invalide, audience non autorisee, compte desactive.

## 3.4.4 UC4 - Mot de passe oublie

1. Acteur principal: Visiteur.
2. Acteur secondaire: Service Email SMTP.
3. Preconditions: adresse email saisie.
4. Scenario nominal:
   - L'utilisateur saisit son email.
   - Le systeme genere un code a 6 chiffres (si compte local existant).
   - Le code est envoye par email.
   - Le systeme renvoie un message neutre pour eviter l'enumeration des comptes.
5. Postconditions: code temporaire stocke en memoire avec expiration.
6. Exceptions: email non associe, compte Google pur, erreur SMTP (message neutre conserve cote API).

## 3.4.5 UC5 - Reinitialiser le mot de passe

1. Acteur principal: Visiteur.
2. Preconditions: code valide et non expire.
3. Scenario nominal:
   - L'utilisateur soumet email, code et nouveau mot de passe.
   - Le systeme verifie le code puis met a jour le mot de passe hache.
   - Le systeme invalide le code utilise.
4. Postconditions: mot de passe mis a jour.
5. Exceptions: code invalide/expire, utilisateur introuvable.

## 3.4.6 UC6 - Consulter son profil

1. Acteur principal: Utilisateur authentifie.
2. Preconditions: token JWT valide.
3. Scenario nominal:
   - L'utilisateur appelle l'endpoint profil.
   - Le systeme extrait l'identite depuis le token et retourne les informations du compte.
4. Postconditions: profil affiche dans l'interface.
5. Exceptions: token invalide/expire, compte desactive.

## 3.4.7 UC7 - Changer son mot de passe

1. Acteur principal: Utilisateur authentifie.
2. Preconditions: compte local et mot de passe actuel correct.
3. Scenario nominal:
   - L'utilisateur saisit mot de passe actuel + nouveau mot de passe.
   - Le systeme verifie l'ancien mot de passe, les regles de complexite et la difference avec l'ancien.
   - Le systeme enregistre le nouveau hash.
4. Postconditions: nouveau mot de passe actif.
5. Exceptions: compte Google pur, ancien mot de passe incorrect, nouveau mot de passe invalide.

## 3.4.8 UC8 - Lister les utilisateurs (admin)

1. Acteur principal: Administrateur.
2. Preconditions: utilisateur connecte avec role admin.
3. Scenario nominal:
   - L'admin consulte la liste paginee des utilisateurs.
   - L'admin applique des filtres (recherche, role, statut).
   - Le systeme retourne les donnees et la pagination.
4. Postconditions: vue de supervision actualisee.
5. Exceptions: acces refuse si role non admin.

## 3.4.9 UC9 - Creer un utilisateur (admin)

1. Acteur principal: Administrateur.
2. Preconditions: role admin.
3. Scenario nominal:
   - L'admin saisit username, email, mot de passe, role.
   - Le systeme verifie unicite puis cree le compte local.
4. Postconditions: nouvel utilisateur present dans le systeme.
5. Exceptions: email/username existant, role invalide.

## 3.4.10 UC10 - Modifier role/statut/suppression (admin)

1. Acteur principal: Administrateur.
2. Preconditions: role admin et utilisateur cible existant.
3. Scenario nominal:
   - L'admin modifie le role ou active/desactive un compte, ou supprime un compte.
   - Le systeme applique la regle metier (interdiction d'auto-modification critique).
4. Postconditions: compte cible mis a jour.
5. Exceptions: tentative sur son propre compte (role/statut/suppression), utilisateur non trouve.

## 3.5 Diagramme de cas d'utilisation - Sprint 1

```mermaid
flowchart LR
    V[Visiteur]
    U[Utilisateur authentifie]
    A[Administrateur]
    G[Google OAuth]
    E[Service Email SMTP]

    subgraph Sprint1[Systeme Sprint 1 - Base projet et authentification]
      UC1((S'inscrire localement))
      UC2((Se connecter localement))
      UC3((Se connecter avec Google))
      UC4((Mot de passe oublie))
      UC5((Reinitialiser mot de passe))
      UC6((Consulter profil))
      UC7((Changer mot de passe))
      UC8((Lister utilisateurs))
      UC9((Creer utilisateur))
      UC10((Modifier role utilisateur))
      UC11((Activer/Desactiver utilisateur))
      UC12((Supprimer utilisateur))
      UC13((Rafraichir token))
    end

    V --> UC1
    V --> UC2
    V --> UC3
    V --> UC4
    V --> UC5

    U --> UC6
    U --> UC7
    U --> UC13

    A --> UC8
    A --> UC9
    A --> UC10
    A --> UC11
    A --> UC12

    UC3 -.verification credential.-> G
    UC4 -.envoi code.-> E
```

## 3.6 Diagramme de classes - Sprint 1

```mermaid
classDiagram
    class User {
      +int id
      +string username
      +string email
      +string hashed_password
      +string full_name
      +string avatar_url
      +string auth_provider
      +string google_id
      +UserRole role
      +bool is_active
      +datetime created_at
      +datetime updated_at
    }

    class UserRole {
      <<enumeration>>
      admin
      formateur
      apprenant
    }

    class RegisterRequest {
      +username: string
      +email: string
      +password: string
      +full_name: string
    }

    class LoginRequest {
      +email: string
      +password: string
    }

    class GoogleAuthRequest {
      +credential: string
    }

    class ForgotPasswordRequest {
      +email: string
    }

    class ResetPasswordRequest {
      +email: string
      +code: string
      +new_password: string
    }

    class ChangePasswordRequest {
      +current_password: string
      +new_password: string
    }

    class RefreshTokenRequest {
      +refresh_token: string
    }

    class TokenResponse {
      +access_token: string
      +refresh_token: string
      +token_type: string
      +expires_in: int
      +user: UserResponse
    }

    class UserResponse {
      +id: int
      +username: string
      +email: string
      +full_name: string
      +avatar_url: string
      +auth_provider: string
      +role: string
      +is_active: bool
      +created_at: datetime
    }

    class AuthService {
      +hash_password(password)
      +verify_password(plain, hashed)
      +create_access_token(data)
      +create_refresh_token(data)
      +decode_access_token(token)
      +decode_refresh_token(token)
      +get_current_user(token, db)
      +verify_google_token(credential)
      +get_or_create_google_user(db, info)
    }

    class AuthAPI {
      +register(request)
      +login(request)
      +google_auth(request)
      +refresh_token(request)
      +forgot_password(request)
      +reset_password(request)
      +change_password(request)
      +get_profile()
    }

    class UsersAPI {
      +list_users(...)
      +get_users_stats()
      +create_user(request)
      +update_user_role(id, request)
      +update_user_status(id, request)
      +delete_user(id)
    }

    class EmailService {
      +store_reset_code(email)
      +verify_reset_code(email, code)
      +consume_reset_code(email)
      +send_reset_email(email, code)
    }

    class SecurityMiddleware {
      +check_login_rate_limit(ip)
      +record_login_attempt(ip)
    }

    AuthAPI --> AuthService : utilise
    AuthAPI --> EmailService : utilise
    AuthAPI --> SecurityMiddleware : utilise
    AuthAPI --> User : persiste/lit
    UsersAPI --> User : persiste/lit

    TokenResponse --> UserResponse : contient
    User --> UserRole : role

    RegisterRequest ..> AuthAPI
    LoginRequest ..> AuthAPI
    GoogleAuthRequest ..> AuthAPI
    ForgotPasswordRequest ..> AuthAPI
    ResetPasswordRequest ..> AuthAPI
    ChangePasswordRequest ..> AuthAPI
    RefreshTokenRequest ..> AuthAPI
```

## 3.7 Diagrammes de sequence - Sprint 1

## 3.7.1 Sequence - Connexion locale

```mermaid
sequenceDiagram
    actor Visiteur
    participant Front as Frontend Angular
    participant AuthAPI as API Auth
    participant Security as Security RateLimit
    participant AuthService as Service Auth
    participant DB as Base MySQL

    Visiteur->>Front: Saisit email + mot de passe
    Front->>AuthAPI: POST /api/auth/login
    AuthAPI->>Security: check_login_rate_limit(ip)
    Security-->>AuthAPI: OK
    AuthAPI->>DB: Rechercher user par email
    DB-->>AuthAPI: User
    AuthAPI->>AuthService: verify_password()
    AuthService-->>AuthAPI: valide
    AuthAPI->>AuthService: create_access_token() + create_refresh_token()
    AuthService-->>AuthAPI: JWT access + refresh
    AuthAPI-->>Front: 200 TokenResponse
    Front-->>Visiteur: Session ouverte + redirection selon role
```

## 3.7.2 Sequence - Connexion Google OAuth

```mermaid
sequenceDiagram
    actor Visiteur
    participant Front as Frontend Angular
    participant Google as Google OAuth
    participant AuthAPI as API Auth
    participant AuthService as Service Auth
    participant DB as Base MySQL

    Visiteur->>Front: Clique sur Se connecter avec Google
    Front->>Google: Demande credential
    Google-->>Front: ID token
    Front->>AuthAPI: POST /api/auth/google (credential)
    AuthAPI->>AuthService: verify_google_token(credential)
    AuthService->>Google: GET tokeninfo
    Google-->>AuthService: Payload valide
    AuthService-->>AuthAPI: google_info
    AuthAPI->>AuthService: get_or_create_google_user(db, info)
    AuthService->>DB: find/create/link user
    DB-->>AuthService: User
    AuthService-->>AuthAPI: User
    AuthAPI->>AuthService: create_access_token() + create_refresh_token()
    AuthAPI-->>Front: 200 TokenResponse
    Front-->>Visiteur: Session ouverte
```

## 3.7.3 Sequence - Mot de passe oublie + reinitialisation

```mermaid
sequenceDiagram
    actor Visiteur
    participant Front as Frontend Angular
    participant AuthAPI as API Auth
    participant EmailSvc as Service Email
    participant SMTP as Serveur SMTP
    participant DB as Base MySQL

    Visiteur->>Front: Saisit email (mot de passe oublie)
    Front->>AuthAPI: POST /api/auth/forgot-password
    AuthAPI->>DB: Verifier utilisateur local
    DB-->>AuthAPI: Existe ou non
    alt Compte local existe
      AuthAPI->>EmailSvc: store_reset_code(email)
      EmailSvc-->>AuthAPI: code 6 chiffres
      AuthAPI->>EmailSvc: send_reset_email(email, code)
      EmailSvc->>SMTP: Envoyer email
      SMTP-->>EmailSvc: OK
    else Compte absent ou Google pur
      AuthAPI-->>AuthAPI: Retour neutre (anti-enumeration)
    end
    AuthAPI-->>Front: 200 message neutre

    Visiteur->>Front: Saisit email + code + nouveau mot de passe
    Front->>AuthAPI: POST /api/auth/reset-password
    AuthAPI->>EmailSvc: verify_reset_code(email, code)
    EmailSvc-->>AuthAPI: code valide
    AuthAPI->>DB: Mettre a jour hashed_password
    DB-->>AuthAPI: Commit OK
    AuthAPI->>EmailSvc: consume_reset_code(email)
    AuthAPI-->>Front: 200 mot de passe reinitialise
```

## 3.7.4 Sequence - Administration des utilisateurs (modifier role)

```mermaid
sequenceDiagram
    actor Admin
    participant Front as Users Management UI
    participant UsersAPI as API Users
    participant AuthService as Service Auth
    participant DB as Base MySQL

    Admin->>Front: Choisit un utilisateur et un nouveau role
    Front->>UsersAPI: PUT /api/users/{id}/role
    UsersAPI->>AuthService: get_current_user(token)
    AuthService-->>UsersAPI: current_user(admin)
    UsersAPI->>UsersAPI: require_admin()
    UsersAPI->>DB: Charger utilisateur cible
    DB-->>UsersAPI: User cible
    alt Cible = admin courant
      UsersAPI-->>Front: 400 modification interdite
    else Cible differente
      UsersAPI->>DB: Mettre a jour role + commit
      DB-->>UsersAPI: OK
      UsersAPI-->>Front: 200 user mis a jour
    end
    Front-->>Admin: Tableau actualise
```

## 3.8 Synthese du Sprint 1

Le Sprint 1 livre une base applicative exploitable, securisee et evolutive:

1. Authentification complete: local, Google, reset mot de passe, refresh token.
2. Controle d'acces solide: JWT, role-based access, guard frontend et verification backend.
3. Administration des comptes: supervision et actions CRUD admin.
4. Durcissement securite: rate limiting, audit logs, headers HTTP de securite.

Ces acquis constituent un socle technique robuste pour les sprints fonctionnels suivants (contenus, QCM, chatbot intelligent, statistiques avancees).
