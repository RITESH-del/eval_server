---
trigger: always_on
---

Tech Stack: Node js, Express, Prisma, Passport.js

* Use `Send` for all API responses.
* Don't modify `index.js`, `db.js`, `.env`, or other high-level files; work only in `./modules`.
* Use naming pattern: `feature.layer.js`.
* Each module must contain: routes, validation, controller, service, repository.
* Follow flow: frontend → routes → validation → controller → service → repository → DB.
* Implement and test one endpoint at a time.
* Match existing code style and conventions.