import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/pagination-order.dto';
import { changeOrderStatus } from './dto/change-order-status.dto';
import { PaidOrderDto } from './dto/paid-order.dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @MessagePattern('orders.create')
    create(@Payload() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @MessagePattern('orders.findAll')
    findAll(@Payload() pagination: OrderPaginationDto) {
        return this.ordersService.findAll(pagination);
    }

    @MessagePattern('orders.findOne')
    findOne(@Payload('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @MessagePattern('orders.changeStatus')
    changeOrderStatus(@Payload() updateOrderDto: changeOrderStatus) {
        return this.ordersService.changeOrderStatus(updateOrderDto);
    }

    @EventPattern('payment.succeeded')
    paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
        return this.ordersService.paidOrder(paidOrderDto);
    }
}
