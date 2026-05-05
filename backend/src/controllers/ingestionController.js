const { ingestWeLoveDevsOffers } = require('../services/offerIngestionService');

// Start a manual import from WeLoveDevs.
// This first version focuses only on data loading.
async function ingestWeLoveDevs(req, res, next) {
  try {
    // Read import options from the request body.
    // Defaults are used when the request body is empty.
    const { page = 0, q = '', size = 20 } = req.body || {};

    // Start the import service with these options.
    const result = await ingestWeLoveDevsOffers({ page, q, size });

    // 201 means that a new import action was created.
    return res.status(201).json({
      status: 'success',
      data:   result,
    });
  } catch (err) {
    // Send errors to the central error handler.
    next(err);
  }
}

module.exports = { ingestWeLoveDevs };
