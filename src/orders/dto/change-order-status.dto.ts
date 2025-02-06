import { OrderStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class changeOrderStatus {
    @IsUUID(4)
    public id: string;

    @IsEnum(OrderStatus, {
        message: `status must be one of the following values: ${Object.values(OrderStatus).join(', ')}`,
    })
    public status: OrderStatus;
}
