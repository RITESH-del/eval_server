

## Architecture

```mermaid
flowchart TD
    A[Application Layer] -->  D[Routing Layer]
    D --> E[Controller Layer]
    E --> Z[Validation]
    E --> F[Service Layer]

    F -.-> |Optional| J[External API]
    F -.-> |Optional| I[(Redis<br>Cache)]
    F --> G[Repository Layer]

    G --> H[(Database<br>MySQL)]    
```

| Layer      | Responsibility                                 | Knows About               |
| ---------- | ---------------------------------------------- | ------------------------- |
| Application| entry point of request                         | Routing                   |
| Routing    | Define API endpoints,orchastrate middleware and delegate requests to controller| controller, middleware     |
| Controller |           HTTP request/response transformation | Service                   |
| Validation | Ensures data Integrity and Consistency in DB  |                  -                 |
| Service    | Business logic, orchestration, transactions    | Repository, External APIs |
| Repository | Data access, query building                    | Database/ORM              |


## Tech Stack
| Layer      | Tools Used                                                                      |
| ---------- | ------------------------------------------------------------------------------- |
| Application|express.js, cors, cookie-parser, dotenv                                          |
| Validation |zod                                                                              |
| Service    |bcrypt, jsonwebtoken                                                             |
| Repository |prisma(ORM), @prisma/client                                                      |

***Other Dependencies***
* **Testing:** Jest, Supertest
* **dev-dependencies:** nodemon, ESlint, globals, @prisma/client
* **api documentation:** swaggerui, swagger-jsdoc

**Programming Language**
* Node js
* MySQL



## JWT Authentication Flow

```mermaid
flowchart TD
    A[User Enters Email & Password] --> B[POST /auth/login]
    B--> |Find User By Email|D{User Exists?} 

    D -->|No| E[Return 401 Invalid Credentials]

    D -->|Yes| F[Compare Password]
    F --> G{Password Correct?}

    G -->|No| E

    G -->|Yes| H[Generate JWT]

    H --> I["JWT Token Payload:
    id
    name
    email
    role"]

    I --> J[Return Access Token]

    J --> |Frontend Stores Token|K[User Accesses Protected Routes]
```

## Authentication and Authorization

```mermaid
flowchart TD
    A[Incoming Request] --> B[JWT Middleware]

    B -->|Invalid Token| C[401 Unauthorized]
    B -->|Valid Token| D[Extract User Role]

    D --> |Check if role matches faculty or student| E{Required Permission?}

    E -->|Permission Exists| F[Execute Controller]
    E -->|Permission Missing| G[403 Forbidden]

    F --> H[Success Response]
```

## Project Folder Structure
```txt
.
├── config
│   └── app.config.js               #For configuration management
├── modules
│   ├── auth
│   │   ├── __tests__
│   │   ├── auth.controller.js
│   │   ├── auth.repository.js
│   │   ├── auth.routes.js
│   │   ├── auth.service.js
│   │   └── auth.validation.js
│   ├── faculty
│   │   ├── __tests__
│   │   ├── faculty.controller.js
│   │   ├── faculty.repository.js
│   │   ├── faculty.routes.js
│   │   ├── faculty.service.js
│   │   └── faculty.validation.js
│   └── users
│       ├── user.controller.js
│       ├── user.repository.js
│       ├── user.routes.js
│       ├── user.service.js
│       └── user.validation.js                   # Soon...
└── shared
|    ├── middleware
|    ├── types
|    └── utils
├── db.js                                         #database connection
└── index.js                                      #entry point
```

## Modules and Responsibilities
* auth - authenications and authorization(assigning roles to user based on email ID)
* app - handles submissions made by user from App and other app related routes.
* student - for viewing results, performance analytics, upcoming examinations, and submission history.
* faculty - for creating exam, exam management, reviewing results, monitoring exams, evaluation of results etc.
* user - for retrieval of user-related information.


**Github Link:** [https://github.com/RITESH-del/eval_server](https://github.com/RITESH-del/eval_server)
**Render Link:** [https://eval-server-bkzt.onrender.com](https://eval-server-bkzt.onrender.com)
