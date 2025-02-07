import {
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/pagination-order.dto';
import { changeOrderStatus } from './dto/change-order-status.dto';
import { PRODUCT_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { Product } from './interfaces/product.interface';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('OrdersService');

    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Connected to the database');
    }

    async create(createOrderDto: CreateOrderDto) {
        try {
            const productIds = createOrderDto.items.map(
                (product) => product.productId,
            );
            const products: Product[] = await firstValueFrom(
                this.productsClient.send(
                    { cmd: 'validateProducts' },
                    productIds,
                ),
            );
            const totalAmount = createOrderDto.items.reduce(
                (acc, orderItem) => {
                    const price = products.find(
                        (product) => product.id === orderItem.productId,
                    )?.price;
                    return acc + price! * orderItem.quantity;
                },
                0,
            );

            const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
                return acc + orderItem.quantity;
            }, 0);

            const order = await this.order.create({
                data: {
                    totalAmount,
                    totalItems,
                    OrderItem: {
                        createMany: {
                            data: createOrderDto.items.map((orderItem) => ({
                                quantity: orderItem.quantity,
                                productId: orderItem.productId,
                                price: Number(
                                    products.find(
                                        (product) =>
                                            product.id === orderItem.productId,
                                    )?.price,
                                ),
                            })),
                        },
                    },
                },
                include: {
                    OrderItem: {
                        select: {
                            quantity: true,
                            price: true,
                            productId: true,
                        },
                    },
                },
            });
            return {
                ...order,
                OrderItem: order.OrderItem.map((orderItem) => ({
                    ...orderItem,
                    name: products.find(
                        (product) => product.id === orderItem.productId,
                    )?.name,
                })),
            };
        } catch (error) {
            throw new RpcException(error as RpcException);
        }
    }

    async findAll(orderPaginationDto: OrderPaginationDto) {
        const { page = 1, limit = 10 } = orderPaginationDto;
        const totalPages = await this.order.count({
            where: {
                status: orderPaginationDto.status,
            },
        });

        return {
            data: await this.order.findMany({
                where: {
                    status: orderPaginationDto.status,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            pagination: {
                page,
                total: totalPages,
                lastPage: Math.ceil(totalPages / limit),
            },
        };
    }

    async findOne(id: string) {
        const order = await this.order.findUnique({
            where: { id },
            include: {
                OrderItem: {
                    select: {
                        quantity: true,
                        price: true,
                        productId: true,
                    },
                },
            },
        });

        if (!order) {
            throw new RpcException({
                status: HttpStatus.NOT_FOUND,
                message: `Order with id ${id} not found`,
            });
        }

        const productIds = order.OrderItem.map(
            (orderItem) => orderItem.productId,
        );

        const products: Product[] = await firstValueFrom(
            this.productsClient.send({ cmd: 'validateProducts' }, productIds),
        );

        return {
            ...order,
            OrderItem: order.OrderItem.map((orderItem) => ({
                ...orderItem,
                name: products.find(
                    (product) => product.id === orderItem.productId,
                )?.name,
            })),
        };
    }

    async changeOrderStatus(changeOrderStatusDto: changeOrderStatus) {
        const { id, status } = changeOrderStatusDto;

        const order = await this.findOne(id);

        if (order.status === status) return order;

        return this.order.update({
            where: { id },
            data: { status },
        });
    }
}
