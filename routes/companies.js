// Import necessary modules
const express = require("express");
const ExpressError = require("../expressError"); // Custom error class for handling errors
const db = require("../db"); // Database connection module

// Create a new router for handling company routes
let router = new express.Router();

// GET route to fetch all companies
router.get("/", async function (req, res, next) {
    try {
        // Query the database for all companies ordered by name
        const result = await db.query(
            `SELECT code, name
             FROM companies
             ORDER BY name`
        );
        // Return the list of companies in JSON format
        return res.json({"companies": result.rows});
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// GET route to fetch a single company by its code
router.get("/:code", async function (req, res, next) {
    try {
        let code = req.params.code; // Extract the company code from URL parameters

        // Query the database for a company by its code
        const compResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
            [code]
        );

        // Query the database for invoices related to the company
        const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
            [code]
        );

        // If the company does not exist, throw an error
        if (compResult.rows.length === 0) {
            throw new ExpressError(`Company is not real: ${code}`, 404);
        }

        const company = compResult.rows[0]; // Access the company data
        const invoices = invResult.rows; // Access the invoices data
        company.invoices = invoices.map(inv => inv.id); // Map invoice IDs to the company object

        // Return the company data, including related invoices, in JSON format
        return res.json({"company": company});
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// PUT route to update a company's details by its code
router.put("/:code", async function (req, res, next) {
    try {
        let { name, description } = req.body; // Extract name and description from request body
        let code = req.params.code; // Extract the company code from URL parameters

        // Update the company in the database
        const result = await db.query(
            `UPDATE companies
             SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
            [name, description, code]
        );

        // If the company does not exist, throw an error
        if (result.rows.length === 0) {
            throw new ExpressError(`Company does not exist: ${code}`, 404);
        } else {
            // Return the updated company data in JSON format
            return res.json({"company": result.rows[0]});
        }
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// DELETE route to delete a company by its code
router.delete("/:code", async function (req, res, next) {
    try {
        let code = req.params.code; // Extract the company code from URL parameters

        // Delete the company from the database
        const result = await db.query(
            `DELETE FROM companies
             WHERE code = $1
             RETURNING code`,
            [code]
        );

        // If the company does not exist, throw an error
        if (result.rows.length == 0) {
            throw new ExpressError(`No company exists: ${code}`, 404);
        } else {
            // Return a deletion confirmation message
            return res.json({"status": "deleted"});
        }
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// Export the router for use in the main app
module.exports = router;

