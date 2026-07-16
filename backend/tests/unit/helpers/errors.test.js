/**
 * Unit tests for utils/errors.js
 * This test covers all AppError subclasses.
 */
import {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    TooManyRequestsError,
    DatabaseError,
    PaymentError,
    InternalError,
} from "../../../utils/errors.js";

describe("utils/errors", () => {
    test("AppError defaults and custom options", () => {
        const def = new AppError("boom");
        expect(def).toBeInstanceOf(Error);
        expect(def.message).toBe("boom");
        expect(def.status).toBe(500);
        expect(def.code).toBe("INTERNAL_ERROR");
        expect(def.details).toBeNull();
        expect(def.name).toBe("AppError");

        const custom = new AppError("x", {
            status: 418,
            code: "TEAPOT",
            details: { a: 1 },
        });
        expect(custom.status).toBe(418);
        expect(custom.code).toBe("TEAPOT");
        expect(custom.details).toEqual({ a: 1 });
    });

    test("ValidationError is 400 VALIDATION_ERROR", () => {
        const err = new ValidationError("bad", [{ path: ["x"] }]);
        expect(err).toBeInstanceOf(AppError);
        expect(err.status).toBe(400);
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.details).toEqual([{ path: ["x"] }]);
        expect(new ValidationError().details).toBeNull();
    });

    test("ValidationError with explicit null details", () => {
        const err = new ValidationError("bad", null);
        expect(err.details).toBeNull();
    });

    test("NotFoundError embeds resource name", () => {
        const err = new NotFoundError("Order");
        expect(err.status).toBe(404);
        expect(err.code).toBe("NOT_FOUND");
        expect(err.message).toBe("Order not found");
        expect(new NotFoundError().message).toBe("Resource not found");
    });

    test("UnauthorizedError / ForbiddenError defaults", () => {
        expect(new UnauthorizedError().status).toBe(401);
        expect(new UnauthorizedError().code).toBe("UNAUTHORIZED");
        expect(new UnauthorizedError("nope").message).toBe("nope");
        expect(new ForbiddenError().status).toBe(403);
        expect(new ForbiddenError().code).toBe("FORBIDDEN");
        expect(new ForbiddenError().message).toBe("Access denied");
        expect(new ForbiddenError("blocked").message).toBe("blocked");
    });

    test("ConflictError / TooManyRequestsError / DatabaseError defaults", () => {
        expect(new ConflictError().message).toBe("Resource conflict");
        expect(new ConflictError().details).toBeNull();

        expect(new TooManyRequestsError().message).toMatch(/Too many requests/);
        expect(new TooManyRequestsError().details).toBeNull();

        expect(new DatabaseError().message).toBe("Database operation failed");
    });

    test("ConflictError / TooManyRequestsError / DatabaseError custom", () => {
        const conflict = new ConflictError("taken", { id: 1 });
        expect(conflict.status).toBe(409);
        expect(conflict.code).toBe("CONFLICT");
        expect(conflict.details).toEqual({ id: 1 });

        const rate = new TooManyRequestsError("slow", { retry: 1 });
        expect(rate.status).toBe(429);
        expect(rate.code).toBe("RATE_LIMITED");

        const db = new DatabaseError("deadlock");
        expect(db.status).toBe(500);
        expect(db.code).toBe("DATABASE_ERROR");
    });

    test("PaymentError / InternalError defaults and custom details", () => {
        expect(new PaymentError().message).toBe("Payment processing failed");
        expect(new PaymentError().details).toBeNull();
        expect(new InternalError().message).toBe("Internal server error");
        expect(new InternalError().details).toBeNull();

        const pay = new PaymentError("declined", { order_id: 9 });
        expect(pay.status).toBe(502);
        expect(pay.code).toBe("PAYMENT_ERROR");
        expect(pay.details).toEqual({ order_id: 9 });

        const internal = new InternalError("oops", { reason: "x" });
        expect(internal.status).toBe(500);
        expect(internal.code).toBe("INTERNAL_ERROR");
        expect(internal.details).toEqual({ reason: "x" });
    });
});
