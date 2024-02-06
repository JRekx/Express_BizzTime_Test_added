// tests/companies.test.js
const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary to import your Express app
const db = require('../db');

beforeAll(async () => {
    // Optional: Seed your test database with data if not using mocks
});

afterAll(async () => {
    // Close the database connection
    await db.end();
});

describe("GET /companies", () => {
    test("It should respond with an array of companies", async () => {
        const response = await request(app).get("/companies");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("companies");
        expect(Array.isArray(response.body.companies)).toBe(true);
        // You might want to add more specific tests here, e.g., checking for the presence of expected properties
    });
});

describe("GET /companies/:code", () => {
    test("It should return the company and its invoices for the given code", async () => {
        const response = await request(app).get("/companies/testcode"); // Use a valid test company code
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("company");
        // Here you can add more assertions, such as checking the structure of the returned company object
    });

    test("It should return a 404 for a non-existent company", async () => {
        const response = await request(app).get("/companies/nonexistentcode");
        expect(response.statusCode).toBe(404);
    });
});

describe("PUT /companies/:code", () => {
    test("It should update a company's details", async () => {
        const newData = { name: "Updated Name", description: "Updated Description" };
        const response = await request(app).put("/companies/testcode").send(newData); // Adjust the company code as necessary
        expect(response.statusCode).toBe(200);
        expect(response.body.company.name).toBe("Updated Name");
        expect(response.body.company.description).toBe("Updated Description");
    });
});

describe("DELETE /companies/:code", () => {
    test("It should delete a company", async () => {
        const response = await request(app).delete("/companies/testcode"); // Ensure this is a test code that can be safely deleted
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({"status": "deleted"});
    });
});

