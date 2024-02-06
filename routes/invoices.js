// Import necessary modules
const express = require("express");
const ExpressError = require("../expressError"); // Custom error handler for uniform error management
const db = require("../db"); // Database connection module

// Initialize an Express router to define API routes
let router = new express.Router();

// GET route to fetch all invoices
router.get("/", async function (req, res, next) {
    try {
        // Execute a query to select all invoices and order them by ID
        const result = await db.query(
            `SELECT id, comp_code
             FROM invoices
             ORDER BY id`
        );

        // Return the list of invoices in JSON format
        return res.json({"invoices": result.rows});
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// GET route to fetch a single invoice by ID
router.get("/:id", async function (req, res, next) {
    try {
        let id = req.params.id; // Extract the invoice ID from the URL parameters
        // Execute a query to select detailed information for a specific invoice by ID, including company details
        const result = await db.query(
            `SELECT i.id,
                i.comp_code,
                i.amt,
                i.paid,
                i.add_date,
                i.paid_date,
                c.name,
                c.description
             FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code) // Corrected table name from 'compaines' to 'companies'
             WHERE i.id = $1`, // Use parameterized query for security
            [id]
        );

        // If no invoice found, throw a custom error
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice does not Exist: ${id}`, 404);
        }

        // Structure the invoice data including company details
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        // Return the invoice data in JSON format
        return res.json({"invoice": invoice});
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// PUT route to update an invoice by ID
router.put("/:id", async function (req, res, next){
    try {
        let {amt, paid} = req.body; // Extract 'amt' and 'paid' status from request body
        let id = req.params.id; // Extract the invoice ID from the URL parameters
        let paidDate = null; // Initialize paidDate

        // Query the current status of the invoice
        const currResult = await db.query(
            `SELECT paid_date
             FROM invoices
             WHERE id = $1`,
            [id]
        );

        // If no invoice found, throw a custom error
        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404); 
        }

        const currPaidDate = currResult.rows[0].paid_date;

        // Determine the correct value for paidDate based on the paid status
        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }

        // Update the invoice in the database
        const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]
        );

        // Return the updated invoice information in JSON format
        return res.json({"invoice": result.rows[0]});
    } catch (err) {
        // Pass any errors to the next middleware (error handler)
        return next(err);
    }
});

// DELETE route to remove an invoice by ID
router.delete("/:id", async function (req, res, next) {
    try {
      let id = req.params.id; // Extract the invoice ID from the URL parameters
  
      // Execute a query to delete the specified invoice
      const result = await db.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING id`, // Return the ID of the deleted invoice
          [id]);
  
      // If no invoice found, throw a custom error
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
      }
  
      // Return a confirmation message
      return res.json({"status": "deleted"});
    } catch (err) {
      // Pass any errors to the next middleware (error handler)
      return next(err);
    }
});

// Export the router to be mounted by the main application
module.exports = router;




