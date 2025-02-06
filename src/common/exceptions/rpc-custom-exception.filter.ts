import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();

        const rpcError = exception.getError();

        if (
            typeof rpcError === 'object' &&
            'status' in rpcError &&
            'message' in rpcError
        ) {
            const status = isNaN(Number(rpcError.status))
                ? 400
                : Number(rpcError.status);
            return response.status(status).json(rpcError);
        }

        response.status(400).json({
            statusCode: 400,
            message: rpcError,
        });
    }
}
