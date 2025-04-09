import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "./request.guard";
import { OAuthGuard } from "./oauth.guard";

@Injectable()
export class CompositeGuard implements CanActivate {
    constructor (private requestGuard : AuthGuard, private oauthGuard : OAuthGuard) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const type = request.headers['x-auth-type'];
        
        if (type === 'jwt') {
            const result = this.requestGuard.canActivate(context);
            return result;
        }
        
        const result = await this.oauthGuard.canActivate(context);
        return result;
    }
}