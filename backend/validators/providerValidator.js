const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const providerProfileValidator = [
  body('specialization').notEmpty().withMessage('Specialization is required').trim(),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('pricePerHour').isNumeric().withMessage('Price per hour must be a number'),
  body('availability').isArray().withMessage('Availability must be an array'),
  body('hospitalId').notEmpty().withMessage('Hospital allocation is required'),
  validate,
];

module.exports = { providerProfileValidator };
