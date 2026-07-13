# Electricity

#### EECS 4413 Project (Group G)

---

## List of Acronyms:

- **GoF:** Gang of Four (list of design patterns)
- **DP:** Design pattern
- **TBD:** To be Determined/Decided
- **FE / BE:** Frontend / Backend
- **MW:** Middleware
- **DAO:** Data Access Object
- **CoR:** Chain of Responsibility (GoF design pattern)
- **HO (Function):** High-order (Function)
- **DTO:** Data Transfer Object
- **CQRS:** Command Query Responsibility Segregation

---

## Status Updates:

- A sufficient starter BE folder structure is generated.
- List of Services are finalized.

**Note:** DAO and database logic is still TBD.
**Note:** Loan Calculator will be implemented in Frondend
**Note:** List of endpoint samples are semi-finalized

---

## List of Design Patterns used:

- **Builder / Singleton**: Email service ( and NodeMailer's Transpoter instance)
- **Decorator**: `TryCatch.js` used for wrapping controllers with try/catch block (acting as global error handling)
- **Chain of Responsibility (CoR)**: Express pipeline (through Middlewares) using `next()` functions

---

## Noteable Technique:

- Usage of HO Functions
- Barrel Exports (example: index.js within `/DAO` or `/services`)
- Functional/Object-Oriented
- Abstractions
- DRY principle

---

## Architecture:

- **MVC / Layered architecture** [_In conjuction with the Frontend_], Model and Controller are clearly implemented
- **Centralized configuration:** `/configs` (more notably `/configs/env.js`) is a single place for service/backend setups
- `/DAO`: Data Access Object

---

## Resources

- https://www.thisdot.co/blog/bullmq-with-expressjs

- https://medium.com/@robinviktorsson/a-guide-to-the-strategy-design-pattern-in-typescript-and-node-js-with-practical-examples-c3d6984a2050

- https://jsdoc.app/

- https://adamcoster.com/blog/javascript-custom-errors

- https://docs.scalev.com/en/storefront-api/auth

- https://docs.scalev.com/api-reference/storefront/merge-a-guest-cart-into-the-authenticated-customer-cart
