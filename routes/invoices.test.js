// tests/invoices.test.js
const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary to import your Express app
const db = require('../db');

beforeAll(async () => {
    // Set up your database or mock database connection
    // For example, you might want to seed the test database with some data
});

afterAll(async () => {
    // Close the database connection to prevent any hanging in the Jest process
    await db.end();
});

describe("GET /invoices", () => {
    test("It should respond with an array of invoices", async () => {
        const response = await request(app).get("/invoices");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("invoices");
        expect(Array.isArray(response.body.invoices)).toBe(true);
        // Add more assertions here as needed
    });
});

describe("GET /invoices/:id", () => {
    test("It should return the invoice for the given id", async () => {
        const response = await request(app).get("/invoices/1"); // Adjust the id as necessary
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("invoice");
        // Add more specific assertions here
    });

    test("It should return a 404 for a missing invoice", async () => {
        const response = await request(app).get("/invoices/9999"); // Use an ID that doesn't exist
        expect(response.statusCode).toBe(404);
    });
});

describe("PUT /invoices/:id", () => {
    test("It should update an invoice", async () => {
        const newInvoiceData = { amt: 500, paid: false };
        const response = await request(app).put("/invoices/1").send(newInvoiceData); // Adjust the id as necessary
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice.amt).toEqual(500);
        // Add more assertions here
    });
});

describe("DELETE /invoices/:id", () => {
    test("It should delete an invoice", async () => {
        const response = await request(app).delete("/invoices/1"); // Adjust the id as necessary
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted" });
    });
});

