const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            // Sanitize HTML/XSS content
            return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] });
        }
        
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        }
        
        return obj;
    };

    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

module.exports = {
    sanitizeInput,
    DOMPurify
};