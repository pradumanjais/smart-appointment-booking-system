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
  body('registrationNumber').notEmpty().withMessage('Medical Registration Number is required').trim(),
  body('medicalCouncil').notEmpty().withMessage('Medical Council Name is required').trim(),
  body('fathersName').notEmpty().withMessage("Father's Name is required").trim(),
  body('mothersName').notEmpty().withMessage("Mother's Name is required").trim(),
  body('yearOfDegreeAchieved').isNumeric().withMessage('Degree achievement year is required'),
  body('bio').notEmpty().withMessage('Professional bio is required').trim(),
  validate,
];

module.exports = { providerProfileValidator };
