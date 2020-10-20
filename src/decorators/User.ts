import { createParamDecorator, ExecutionContext } from '@nestjs/common'


export type User = {sub:string}

export const User = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		if (request) {
			const user = request.user
			return data ? user && user[data] : user
		}
		return request.user
	},
)
