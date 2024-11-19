import { RateLimiterMemory } from 'rate-limiter-flexible';

// Configure rate limiter
const rateLimiter = new RateLimiterMemory({
    points: 5, // Number of allowed attempts
    duration: 60, // Per 60 seconds
    keyPrefix: 'rate-limit', // Optional prefix for identifying requests
});

/**
 * Middleware to enforce rate limiting on incoming requests.
 * @param {Request} req - Incoming HTTP request.
 * @returns {Promise<boolean>} - Resolves true if allowed, throws error otherwise.
 */
export async function rateLimit(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        // Consume a point for this IP address
        await rateLimiter.consume(ip);
        return true; // Allowed
    } catch (rateLimiterRes) {
        throw new Response(
            JSON.stringify({
                error: 'Too many requests. Please try again later.',
            }),
            {
                status: 429, // Too Many Requests
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
