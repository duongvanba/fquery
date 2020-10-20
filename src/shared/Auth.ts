import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common"
import { auth } from 'firebase-admin' 


@Injectable()
export class AuthGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {


		const req = context.switchToHttp().getRequest()
		const authorization = req.headers.authorization 

		try { 
			const user = await auth().verifyIdToken(authorization)
			req.user = user
			return true
		} catch (e) { 
			return false
		}


	}
}
