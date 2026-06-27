import Send from "../utils/response.util.js";
import jwt from 'jsonwebtoken'
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Send.unauthorized(res, null, "Token not found");
        }

        const token = authHeader.split(' ')[1];

        const verified = jwt.verify(token, process.env.AUTH_SECRET);
        console.log("Verified JWT:", verified);

        req.user = verified;
        next();
    } catch (err) {
        console.error("Authentication failed:", err);
        return Send.unauthorized(res, null);
    }
}