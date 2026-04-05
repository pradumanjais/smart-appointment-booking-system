const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const bookingValidator = [
  body('providerId').isMongoId().withMessage('Invalid Provider ID'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('startTime').matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
  body('endTime').matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
  validate,
];

module.exports = { bookingValidator };
