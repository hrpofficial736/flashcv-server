import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtService {
    private readonly secret : jwt.Secret = process.env.SUPABASE_JWT_SECRET ?? "";
    verifyToken (token: string) {
        try {            
            const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}