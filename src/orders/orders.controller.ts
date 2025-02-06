import {
    Controller,
    NotImplementedException,
    ParseUUIDPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @MessagePattern({ cmd: 'createOrder' })
    create(@Payload() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @MessagePattern({ cmd: 'findAllOrders' })
    findAll() {
        return this.ordersService.findAll();
    }

    @MessagePattern({ cmd: 'findOneOrder' })
    findOne(@Payload('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @MessagePattern({ cmd: 'changeOrderStatus' })
    changeOrderStatus(@Payload() updateOrderDto: UpdateOrderDto) {
        throw new NotImplementedException();
    }
}
