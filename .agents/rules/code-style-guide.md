---
trigger: always_on
---

* use `Send` from `./shared/utils/response.util.js` to send json requests to client.
* `index.js` is the main entry point of this project don't write or change anything in it. instead create new features in `./modules`. For e.g. `auth`, `users` etc.
* Don't make changes to high level files. for e.g. `db.js`, `.env`, `index.js`.
* File naming convention: name file like this `feature.layer1.layer2.js`. For e.g. `auth.controller.js` or `auth.controller.test.js`.
* Each feature in `./modules` need to have a routes, validation, controller, service, repository. Follow this 5 layered structure when building a new feature.
* When building a new feature keep this data flow in mind: frontend --> routes --> validation(via middleware) --> controller --> service --> repository --> Database
* When building features build a single part of feature first and then test it. For example: in auth module, don't build all login, logout, signup, googleLogin at once. Build signup first, then test its api endpoint by sending a valid request. Then, build login test it again and soon.
* When testing 